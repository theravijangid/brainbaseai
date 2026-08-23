import { BillingProvider } from './billing-provider.interface'
import Razorpay from 'razorpay'
import appConfig from '../../config/config'
import crypto from 'crypto'
import logger from '../../config/logger'

export class RazorpayBillingProvider implements BillingProvider {
  private razorpay: Razorpay | null = null

  constructor() {
    if (appConfig.razorpay.keyId && appConfig.razorpay.keySecret) {
      this.razorpay = new Razorpay({
        key_id: appConfig.razorpay.keyId,
        key_secret: appConfig.razorpay.keySecret,
      })
    } else {
      logger.warn('Razorpay configuration missing. Billing provider will not function correctly.')
    }
  }

  async createCustomer(companyId: string, email: string, name: string): Promise<string> {
    if (!this.razorpay) throw new Error('Razorpay not configured')
    const customer = await this.razorpay.customers.create({
      name,
      email,
      notes: { companyId },
    })
    return customer.id
  }

  async createSubscription(customerId: string, planProviderId: string): Promise<any> {
    if (!this.razorpay) throw new Error('Razorpay not configured')
    const subscription = await this.razorpay.subscriptions.create({
      plan_id: planProviderId,
      customer_id: customerId,
      total_count: 120, // Example count, Razorpay requires this for standard subscriptions
    } as any)
    return subscription
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    if (!this.razorpay) throw new Error('Razorpay not configured')
    const subscription = await this.razorpay.subscriptions.cancel(subscriptionId)
    return subscription
  }

  async getSubscription(subscriptionId: string): Promise<any> {
    if (!this.razorpay) throw new Error('Razorpay not configured')
    const subscription = await this.razorpay.subscriptions.fetch(subscriptionId)
    return subscription
  }

  verifyWebhook(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return expectedSignature === signature
  }
}
