const tiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: '29',
    description: 'Perfect for getting started',
    features: ['5 projects', 'Basic analytics', 'Email support'],
    cta: 'Get Started',
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '79',
    description: 'For growing teams',
    features: ['Unlimited projects', 'Advanced analytics', 'Priority support', 'Custom domains'],
    cta: 'Start Free Trial',
    highlighted: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Dedicated account manager', 'Custom integrations', 'SLA'],
    cta: 'Contact Sales',
  },
]

export default function PricingCard() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 cursor-pointer hover:opacity-75 transition" data-schema-id="pricing-title" data-editable-field="title">Simple, transparent pricing</h2>
          <p className="text-xl text-slate-600 cursor-pointer hover:opacity-75 transition" data-schema-id="pricing-subtitle" data-editable-field="subtitle">Choose the plan that fits your needs</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`rounded-2xl border p-8 transition ${
                tier.highlighted
                  ? 'border-blue-500 bg-blue-50 shadow-xl scale-105'
                  : 'border-slate-200 bg-white shadow-sm'
              }`}
            >
              <h3 className="text-2xl font-bold text-slate-900 mb-2 cursor-pointer hover:opacity-75 transition" data-schema-id={`tier-${tier.id}-name`} data-editable-field="name" data-item-id={tier.id}>{tier.name}</h3>
              <p className="text-slate-600 text-sm mb-6 cursor-pointer hover:opacity-75 transition" data-schema-id={`tier-${tier.id}-description`} data-editable-field="description" data-item-id={tier.id}>{tier.description}</p>

              <div className="mb-6">
                <span className="text-5xl font-bold text-slate-900 cursor-pointer hover:opacity-75 transition" data-schema-id={`tier-${tier.id}-price`} data-editable-field="price" data-item-id={tier.id}>${tier.price}</span>
                {tier.price !== 'Custom' && <span className="text-slate-600 ml-2">/month</span>}
              </div>

              <button
                className={`w-full rounded-lg px-6 py-3 font-semibold mb-8 transition cursor-pointer hover:opacity-75 ${
                  tier.highlighted
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border border-slate-300 text-slate-900 hover:bg-slate-50'
                }`}
                data-schema-id={`tier-${tier.id}-cta`}
                data-editable-field="cta"
                data-item-id={tier.id}
              >
                {tier.cta}
              </button>

              <ul className="space-y-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-sm text-slate-700">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
