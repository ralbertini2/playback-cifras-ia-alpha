// Contratos futuros de pagamento — sem cobrança real nesta versão.
export class PaymentProvider {
  async createCheckoutSession(_payload){ throw new Error('Not implemented'); }
  async cancelSubscription(_subscriptionId){ throw new Error('Not implemented'); }
  async handleWebhook(_event){ throw new Error('Not implemented'); }
}

export const FUTURE_PROVIDERS = ['asaas', 'mercado-pago', 'stripe'];
