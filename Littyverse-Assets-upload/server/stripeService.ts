// Stripe service - handles direct Stripe API operations
import { getUncachableStripeClient } from "./stripeClient";

export class StripeService {
  async createCustomer(email: string, userId: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.customers.create({
      email,
      metadata: { userId },
    });
  }

  async createCheckoutSession(
    customerId: string | undefined,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerEmail?: string
  ) {
    const stripe = await getUncachableStripeClient();
    const sessionParams: {
      customer?: string;
      customer_email?: string;
      payment_method_types: ("card")[];
      line_items: { price: string; quantity: number }[];
      mode: "subscription";
      success_url: string;
      cancel_url: string;
    } = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
    };
    if (customerId) {
      sessionParams.customer = customerId;
    } else if (customerEmail) {
      sessionParams.customer_email = customerEmail;
    }
    return await stripe.checkout.sessions.create(sessionParams);
  }

  async createCustomerPortalSession(customerId: string, returnUrl: string) {
    const stripe = await getUncachableStripeClient();
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
  }
}

export const stripeService = new StripeService();
