export interface BillingProvider {
  createCustomer(companyId: string, email: string, name: string): Promise<string>
  createSubscription(customerId: string, planProviderId: string): Promise<any>
  cancelSubscription(subscriptionId: string): Promise<any>
  getSubscription(subscriptionId: string): Promise<any>
  verifyWebhook(payload: any, signature: string, secret: string): boolean
}
