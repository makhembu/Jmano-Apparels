import React from 'react';

interface OrderStatusTrackerProps {
  status: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

const steps = [
  { name: 'Order Placed', statuses: ['Pending', 'Processing', 'Shipped', 'Delivered'] },
  { name: 'Processing', statuses: ['Processing', 'Shipped', 'Delivered'] },
  { name: 'Shipped', statuses: ['Shipped', 'Delivered'] },
  { name: 'Delivered', statuses: ['Delivered'] }
];

const getStepDate = (stepName: string, { createdAt, shippedAt, deliveredAt }: OrderStatusTrackerProps) => {
  switch (stepName) {
    case 'Order Placed': return createdAt;
    case 'Shipped': return shippedAt;
    case 'Delivered': return deliveredAt;
    default: return undefined;
  }
};

const CheckIcon = () => (
  <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.052-.143z" clipRule="evenodd" />
  </svg>
);

export const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = (props) => {
  const { status } = props;
  const currentStepIndex = steps.findIndex(step => step.name.toLowerCase() === status.toLowerCase());
  // If status is 'Pending', treat 'Order Placed' (index 0) as current. Otherwise, find the matching step.
  // If status isn't found (e.g., an edge case), assume it's at the start.
  const activeStep = status === 'Pending' ? 0 : (currentStepIndex !== -1 ? currentStepIndex : 0);

  if (status === 'Cancelled' || status === 'Refunded') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
         <h3 className="text-lg font-bold text-red-800">Order {status}</h3>
         <p className="text-sm text-red-600 mt-1">This order is no longer active. Contact support for assistance.</p>
      </div>
    );
  }

  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-start">
        {steps.map((step, stepIdx) => {
          const isCompletedOrCurrent = stepIdx <= activeStep;
          
          return (
            <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
              
              {/* Connector line - positioned behind the circles */}
              {stepIdx < steps.length - 1 && (
                <div
                  className={`absolute left-4 top-4 h-0.5 w-full ${
                    stepIdx < activeStep ? 'bg-brand-green' : 'bg-gray-300'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Circle and text group */}
              <div className="relative"> {/* Use relative here to allow z-10 on circle to work */}
                <div className="flex items-center">
                  <span className="flex h-9 items-center">
                    <span
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        isCompletedOrCurrent ? 'bg-brand-green' : 'border-2 border-gray-300 bg-white'
                      }`}
                    >
                      {isCompletedOrCurrent ? (
                        <CheckIcon />
                      ) : (
                        <span className="h-2.5 w-2.5 rounded-full bg-transparent" />
                      )}
                    </span>
                  </span>
                </div>
                <div className="mt-2 min-w-0">
                  <span
                    className={`block text-xs font-bold ${
                      isCompletedOrCurrent ? 'text-brand-dark' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </span>
                  {getStepDate(step.name, props) && (
                    <span className="block text-[10px] text-gray-500">
                      {new Date(getStepDate(step.name, props)!).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

            </li>
          );
        })}
      </ol>
    </nav>
  );
};
