const features = [
{
  id: 'fast-edits',
  icon: '⚡',
  title: 'Lightning Fast',
  description: 'Edit and see changes instantly with live preview'
},
{
  id: 'code-first',
  icon: '💻',
  title: 'Code First',
  description: 'Source code stays clean, readable, and version-controlled'
},
{
  id: 'tailwind-native',
  icon: '🎨',
  title: 'Tailwind Native',
  description: 'Full Tailwind support with intelligent class controls'
},
{
  id: 'team-ready',
  icon: '👥',
  title: 'Team Ready',
  description: 'Designers and developers work together seamlessly'
}];


export default function FeatureCard() {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl font-bold text-slate-900 mb-4"
            data-schema-id="feature-heading"
            data-editable-field="text"
          >
            Powerful features for modern development
          </h2>
          <p
            className="text-xl text-slate-600"
            data-schema-id="feature-subheading"
            data-editable-field="text"
          >
            Everything you need to build beautiful UIs
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) =>
          <div key={feature.id} className="text-center">
              <div className="text-5xl mb-4 cursor-pointer hover:opacity-75 transition" data-schema-id={`feature-${feature.id}-icon`} data-editable-field="icon" data-item-id={feature.id}>{feature.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-2 cursor-pointer hover:opacity-75 transition" data-schema-id={`feature-${feature.id}-title`} data-editable-field="title" data-item-id={feature.id}>{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed cursor-pointer hover:opacity-75 transition" data-schema-id={`feature-${feature.id}-description`} data-editable-field="description" data-item-id={feature.id}>{feature.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}