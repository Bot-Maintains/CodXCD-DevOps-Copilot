import Stripe from 'stripe';
import { config } from './config';

const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export const PLAN_PRICES = {
  free: null,
  pro: 'price_xyz123', // Replace with your actual Stripe price IDs
  enterprise: 'price_xyz456',
};

export async function createCheckoutSession(planTier: string, userLogin: string) {
  try {
    const priceId = PLAN_PRICES[planTier];
    if (!priceId) {
      throw new Error('Invalid plan tier');
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: `${userLogin}@github.com`, // This would be replaced with actual user email
      client_reference_id: userLogin,
      success_url: `${config.appUrl}/subscription?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.appUrl}/subscription?canceled=true`,
      metadata: {
        userLogin,
        planTier,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export { stripe };
