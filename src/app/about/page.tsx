import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us | AgriServe',
  description: 'Learn about AgriServe - India\'s trusted platform for agricultural equipment rental and skilled labor hiring.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
            About AgriServe
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Empowering farmers across India with quality agricultural equipment and skilled labor
          </p>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-4xl mx-auto">
          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-400">
              AgriServe is dedicated to revolutionizing agriculture in India by providing easy access to 
              modern farming equipment and skilled agricultural labor. We believe that every farmer deserves 
              access to the tools and expertise needed to maximize their productivity and profitability.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">What We Do</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Equipment Rental</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Access a wide range of agricultural machinery from tractors to harvesters at affordable rates.
                </p>
              </div>
              <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-2">Labor Hiring</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Connect with skilled agricultural workers for seasonal and permanent positions.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <ul className="space-y-3 text-slate-600 dark:text-slate-400">
              <li>✓ <strong>Farmer First:</strong> We prioritize the needs of farmers in everything we do</li>
              <li>✓ <strong>Quality:</strong> We ensure all equipment is well-maintained and reliable</li>
              <li>✓ <strong>Affordability:</strong> Fair pricing that makes modern farming accessible to all</li>
              <li>✓ <strong>Sustainability:</strong> Promoting eco-friendly farming practices</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
