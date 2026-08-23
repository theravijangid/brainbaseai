import { Request, Response } from 'express'
import appConfig from '../config/config'
import logger from '../config/logger'
import { RazorpayBillingProvider } from '../services/billing/razorpay.provider'
import WebhookEvent from '../models/webhook-event.model'
import Subscription from '../models/subscription.model'
import sequelize from '../database'

const billingProvider = new RazorpayBillingProvider()

export const razorpayWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['x-razorpay-signature'] as string
  const secret = appConfig.razorpay.webhookSecret

  if (!signature || !secret) {
    logger.error('Missing Razorpay webhook signature or secret config.')
    res.status(400).send('Missing signature or secret')
    return
  }

  const rawBody = req.body.toString() // req.body will be a Buffer because of express.raw()

  // Verify Signature
  const isValid = billingProvider.verifyWebhook(rawBody, signature, secret)
  if (!isValid) {
    logger.warn('Invalid Razorpay webhook signature.')
    res.status(400).send('Invalid signature')
    return
  }

  let eventPayload
  try {
    eventPayload = JSON.parse(rawBody)
  } catch (err) {
    logger.error('Failed to parse Razorpay webhook payload.', { error: err })
    res.status(400).send('Invalid JSON payload')
    return
  }

  const eventId = eventPayload.account_id + '_' + eventPayload.event // Ensure uniqueness or rely on eventPayload.id if razorpay sends one. Actually Razorpay sends 'x-razorpay-event-id' header or payload has no ID for the event itself always? Let's check headers.
  const rzpEventId = req.headers['x-razorpay-event-id'] as string || eventPayload.event + '_' + Date.now().toString()

  // Idempotency check
  const existingEvent = await WebhookEvent.findOne({
    where: { provider: 'razorpay', eventId: rzpEventId },
  })

  if (existingEvent) {
    logger.info(`Webhook event already processed: ${rzpEventId}`)
    res.status(200).send('Already processed')
    return
  }

  const t = await sequelize.transaction()
  try {
    // Process Event
    const eventType = eventPayload.event
    const payloadEntity = eventPayload.payload?.subscription?.entity

    if (payloadEntity && (eventType === 'subscription.charged' || eventType === 'subscription.halted' || eventType === 'subscription.cancelled' || eventType === 'subscription.activated')) {
      const providerSubscriptionId = payloadEntity.id
      const status = payloadEntity.status

      const subscription = await Subscription.findOne({
        where: { providerSubscriptionId },
        transaction: t
      })

      if (subscription) {
        // Map razorpay status to our local status
        // Razorpay status: created, authenticated, active, pending, halted, cancelled, completed, expired
        let localStatus = subscription.status
        if (status === 'active' || status === 'authenticated') {
          localStatus = 'active'
        } else if (status === 'halted' || status === 'past_due') {
          localStatus = 'past_due'
        } else if (status === 'cancelled') {
          localStatus = 'canceled'
        } else if (status === 'expired' || status === 'completed') {
          localStatus = 'canceled' // or 'expired' if we had it
        }

        await subscription.update({
          status: localStatus,
          currentPeriodStart: new Date(payloadEntity.current_start * 1000),
          currentPeriodEnd: new Date(payloadEntity.current_end * 1000),
        }, { transaction: t })

        logger.info(`Updated subscription ${subscription.id} status to ${localStatus}`)
      } else {
        logger.warn(`Subscription not found for provider ID: ${providerSubscriptionId}`)
      }
    } else {
       logger.info(`Ignored unhandled Razorpay event type: ${eventType}`)
    }

    // Mark as processed
    await WebhookEvent.create({
      provider: 'razorpay',
      eventId: rzpEventId,
      eventType: eventPayload.event,
      status: 'PROCESSED',
    }, { transaction: t })

    await t.commit()
    res.status(200).send('OK')
  } catch (error: any) {
    await t.rollback()
    logger.error('Error processing Razorpay webhook:', error)
    
    // Mark as failed
    await WebhookEvent.create({
      provider: 'razorpay',
      eventId: rzpEventId,
      eventType: eventPayload.event,
      status: 'FAILED',
      failureReason: error.message || 'Unknown error',
    })

    res.status(500).send('Internal Server Error')
  }
}
