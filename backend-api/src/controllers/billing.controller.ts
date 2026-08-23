import { Request, Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import ApiResponseHandler from '../helpers/api-response-handling.class';
import { Plan, Subscription, PlanPrice } from '../models';
import Logger from '../config/logger';

import appConfig from '../config/config';

function getRazorpayClient(): Razorpay {
  const keyId = appConfig.razorpay.keyId || process.env.RAZORPAY_KEY_ID || 'dummy_key_id';
  const keySecret = appConfig.razorpay.keySecret || process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export class BillingController {
  
  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = await Plan.findAll({
        include: [{ model: PlanPrice, as: 'prices', required: false }],
        order: [['createdAt', 'ASC']],
      });

      // Format response to match the frontend expectations
      const formattedPlans = plans.map(p => {
        const metadata = typeof p.metadata === 'string' ? JSON.parse(p.metadata) : (p.metadata || {});
        const maxWorkspaces = metadata.max_workspaces ?? metadata.maxWorkspaces;
        const maxSources = metadata.max_sources_per_workspace ?? metadata.maxSourcesPerWorkspace;
        const maxAgents = metadata.max_active_agents ?? metadata.maxActiveAgents;
        const knowledgeChat = metadata.knowledge_chat_quota ?? metadata.knowledgeChatQuota;
        const supportConversations = metadata.support_conversation_quota ?? metadata.supportConversationQuota;

        return {
          id: p.id,
          name: p.name,
          price: p.prices?.[0]?.amount ? p.prices[0].amount / 100 : 0, // Assuming amount is in cents
          currency: p.prices?.[0]?.currency || 'usd',
          highlighted: p.name.toLowerCase() === 'pro',
          limits: {
            workspaces: maxWorkspaces === -1 ? 'Unlimited workspaces' : `${maxWorkspaces ?? 1} workspaces`,
            sources: maxSources === -1 ? 'Unlimited sources' : `${maxSources ?? 5} sources per workspace`,
            agents: `${maxAgents ?? 1} active agents`,
            knowledgeChat: `${knowledgeChat ?? 100} messages / month`,
            supportConversations: `${supportConversations ?? 100} conversations / month`,
          }
        };
      });

      ApiResponseHandler.handleSuccessResponse(res, 'Plans fetched successfully', formattedPlans);
    } catch (error: any) {
      Logger.error(`Error fetching plans: ${error.message}`);
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch plans', error.message);
    }
  }

  async getSubscription(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company;
      if (!company) {
        return ApiResponseHandler.handleUnauthorizedRequest(res, 'Company not found');
      }

      const subscription = await Subscription.findOne({
        where: { companyId: company.id, status: 'active' },
        include: [{ model: Plan, as: 'plan' }],
        order: [['createdAt', 'DESC']],
      });

      if (!subscription) {
        return ApiResponseHandler.handleSuccessResponse(res, 'No active subscription', null);
      }

      ApiResponseHandler.handleSuccessResponse(res, 'Subscription fetched successfully', {
        id: subscription.id,
        planId: subscription.planId,
        planName: subscription.plan?.name,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currency: 'USD',
      });
    } catch (error: any) {
      Logger.error(`Error fetching subscription: ${error.message}`);
      ApiResponseHandler.handleErrorReponse(res, 'Failed to fetch subscription', error.message);
    }
  }

  async createCheckoutSession(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company;
      if (!company) {
        return ApiResponseHandler.handleUnauthorizedRequest(res, 'Company not found');
      }

      const { planId } = req.body;
      if (!planId) {
        return ApiResponseHandler.handleBadRequest(res, 'planId is required');
      }

      const plan = await Plan.findByPk(planId, {
        include: [{ model: PlanPrice, as: 'prices', required: false }]
      });

      if (!plan || !plan.prices || plan.prices.length === 0) {
        return ApiResponseHandler.handleNotFoundRequest(res, 'Plan not found or has no price configured');
      }

      const price = plan.prices[0];
      const amount = price.amount; // amount is already in cents
      const currency = (price.currency || 'USD').toUpperCase();

      if (amount <= 0) {
        return ApiResponseHandler.handleBadRequest(res, 'Free plan does not require checkout');
      }

      // Razorpay receipt has a strict maximum length of 40 characters
      const receipt = `rcpt_${Date.now()}_${company.id.replace(/-/g, '').substring(0, 10)}`;

      const options = {
        amount,
        currency,
        receipt,
        notes: {
          companyId: company.id,
          planId: planId,
        }
      };

      const razorpay = getRazorpayClient();
      const order = await razorpay.orders.create(options);

      const keyId = appConfig.razorpay.keyId || process.env.RAZORPAY_KEY_ID || 'dummy_key_id';

      ApiResponseHandler.handleSuccessResponse(res, 'Checkout order created', {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: keyId
      });
    } catch (error: any) {
      Logger.error(`Error creating checkout session: ${error?.message || error}`);
      ApiResponseHandler.handleErrorReponse(res, error?.error?.description || error?.message || 'Failed to create checkout session', error?.message);
    }
  }

  async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const company = req.company;
      if (!company) {
        return ApiResponseHandler.handleUnauthorizedRequest(res, 'Company not found');
      }

      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;

      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const keySecret = appConfig.razorpay.keySecret || process.env.RAZORPAY_KEY_SECRET || 'dummy_secret';
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return ApiResponseHandler.handleBadRequest(res, 'Invalid payment signature');
      }

      // Deactivate current active subscriptions
      await Subscription.update(
        { status: 'canceled' },
        { where: { companyId: company.id, status: 'active' } }
      );

      // Add one month from now
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);

      // Create new subscription
      const newSub = await Subscription.create({
        companyId: company.id,
        planId,
        status: 'active',
        stripeSubscriptionId: razorpay_payment_id, // Using this field for Razorpay payment id
        stripeCustomerId: company.id, // Mock
        stripePriceId: planId, // Mock
        currentPeriodStart: new Date(),
        currentPeriodEnd: currentPeriodEnd,
        cancelAtPeriodEnd: false
      });

      ApiResponseHandler.handleSuccessResponse(res, 'Payment verified and subscription activated', newSub);
    } catch (error: any) {
      Logger.error(`Error verifying payment: ${error.message}`);
      ApiResponseHandler.handleErrorReponse(res, 'Failed to verify payment', error.message);
    }
  }
}

export default new BillingController();
