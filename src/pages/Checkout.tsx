import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const selectedPlan = searchParams.get('plan');

  const { data: plansData } = useQuery(['plans'], 
    () => fetch('/api/subscription/plans').then(res => res.json())
  );

  const plan = plansData?.plans[selectedPlan];

  if (!plan) {
    return <div>Plan not found</div>;
  }

  const handleCheckout = async () => {
    try {
      // This would integrate with Stripe, GitHub Marketplace, or your payment provider
      const response = await fetch('/api/subscription/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: selectedPlan,
        }),
      });

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">{plan.name} Plan</h2>
          <div className="text-3xl font-bold mb-6">
            ${plan.price}<span className="text-lg font-normal">/month</span>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold mb-2">Included Features:</h3>
            <ul className="space-y-2">
              {Object.entries(plan.features).map(([feature, enabled]) => (
                <li key={feature} className={enabled ? 'text-gray-900' : 'text-gray-400'}>
                  {enabled ? '✓' : '×'} {feature.replace(/([A-Z])/g, ' $1').trim()}
                </li>
              ))}
            </ul>
          </div>

          <Button
            onClick={handleCheckout}
            className="w-full"
          >
            Proceed to Payment
          </Button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          By proceeding with the payment, you agree to our terms of service and privacy policy.
          Your subscription will automatically renew each month.
        </p>
      </div>
    </div>
  );
}
