// Stripe client - uses environment secret keys directly
// Note: Using STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY from Replit Secrets
// instead of Replit connector API, per user's manual key setup
import Stripe from "stripe";

function getCredentials() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!publishableKey || !secretKey) {
    throw new Error("STRIPE_PUBLISHABLE_KEY and STRIPE_SECRET_KEY must be set in environment secrets");
  }

  return { publishableKey, secretKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = getCredentials();
  return new Stripe(secretKey);
}

export async function getStripePublishableKey() {
  const { publishableKey } = getCredentials();
  return publishableKey;
}

export async function getStripeSecretKey() {
  const { secretKey } = getCredentials();
  return secretKey;
}

/** Stripe sync instance (from stripe-replit-sync); typed as unknown to avoid dependency shape coupling */
let stripeSync: { processWebhook: (p: Buffer, s: string) => Promise<void>; findOrCreateManagedWebhook: (url: string) => Promise<{ webhook?: { url: string } }>; syncBackfill: () => Promise<void> } | null = null;

export async function getStripeSync() {
  if (!stripeSync) {
    const { StripeSync } = await import('stripe-replit-sync');
    const secretKey = await getStripeSecretKey();

    stripeSync = new StripeSync({
      poolConfig: {
        connectionString: process.env.DATABASE_URL!,
        max: 2,
      },
      stripeSecretKey: secretKey,
    });
  }
  return stripeSync;
}
