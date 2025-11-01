import { Wallet, ShieldCheck, Truck, BadgeCheck } from "lucide-react";

const icons = { Wallet, ShieldCheck, Truck, BadgeCheck };

export default function FeatureHighlights({ features }) {
  return (
    <section className="bg-gray-50 py-16 px-6 md:px-12 text-center">
      <h2 className="text-3xl font-bold mb-10 text-gray-900">
        Why Choose This Product?
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {features.map((f, i) => {
          const Icon = icons[f.icon];
          return (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition"
            >
              <Icon className="w-10 h-10 text-orange-600 mx-auto mb-3" />
              <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-gray-600 text-sm">{f.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
