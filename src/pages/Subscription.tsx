import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlanTier, PlanFeatures } from '../server/utils/plan';
import { Button } from '../components/ui/Button';

interface Plan {
  name: string;
  features: PlanFeatures;
  price: number;
}

interface PlansResponse {
  plans: Record<PlanTier, Plan>;
}

const FeatureCheck: React.FC<{ included: boolean }> = ({ included }) => (
  <span className={included ? 'text-green-500' : 'text-gray-400'}>
    {included ? '✓' : '×'}
  </span>
);

export default function SubscriptionPage() {
  const { data: plansData, isLoading } = useQuery<PlansResponse>(['plans'], 
    () => fetch('/api/subscription/plans').then(res => res.json())
  );

  const { data: userPlan } = useQuery(['userPlan'], 
    () => fetch('/api/subscription/current-user').then(res => res.json())
  );

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!plansData) {
    return <div>Error loading plans</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription Plans</h1>
      
      <div className="grid md:grid-cols-3 gap-8">
        {Object.entries(plansData.plans).map(([tier, plan]) => (
          <div key={tier} className={`
            rounded-lg border p-6 
            ${tier === 'enterprise' ? 'border-purple-500' : 
              tier === 'pro' ? 'border-blue-500' : 'border-gray-200'}
          `}>
            <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
            <div className="text-3xl font-bold mb-6">
              ${plan.price}<span className="text-lg font-normal">/month</span>
            </div>

            <ul className="space-y-3 mb-8">
              <li>
                <FeatureCheck included={plan.features.aiCodeFixing} />
                {' '}AI Code Fixing
              </li>
              <li>
                <FeatureCheck included={plan.features.advancedSecurity} />
                {' '}Advanced Security
              </li>
              <li>
                <FeatureCheck included={plan.features.unlimitedCICD} />
                {' '}Unlimited CI/CD
              </li>
              <li>
                <FeatureCheck included={plan.features.prioritySupport} />
                {' '}Priority Support
              </li>
              <li>
                <FeatureCheck included={plan.features.teamManagement} />
                {' '}Team Management
              </li>
              <li>
                <FeatureCheck included={plan.features.analytics} />
                {' '}Advanced Analytics
              </li>
              <li>
                <FeatureCheck included={plan.features.customIntegrations} />
                {' '}Custom Integrations
              </li>
              <li>
                Projects: {plan.features.maxProjects === -1 ? 'Unlimited' : plan.features.maxProjects}
              </li>
            </ul>

            <Button
              variant={tier === userPlan?.plan ? 'secondary' : 'default'}
              className="w-full"
              disabled={tier === userPlan?.plan}
              onClick={async () => {
                try {
                  const response = await fetch('/api/subscription/create-checkout', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ plan: tier }),
                  });

                  const { url } = await response.json();
                  if (url) {
                    window.location.href = url;
                  }
                } catch (error) {
                  console.error('Error initiating checkout:', error);
                  // You would want to show an error toast here
                }
              }}
            >
              {tier === userPlan?.plan ? 'Current Plan' : 'Upgrade'}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
