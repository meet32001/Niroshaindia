import { MapPin, PhoneCall, Clock, Mail } from "lucide-react";

export function FooterTop() {
  const TOUCHPOINTS = [
    {
      icon: MapPin,
      title: "Visit Us",
      subtitle: "Mumbai, Maharashtra, India",
    },
    {
      icon: PhoneCall,
      title: "Call Us",
      subtitle: "+91 1800-NIROSHA",
    },
    {
      icon: Clock,
      title: "Working Hours",
      subtitle: "Mon - Sat: 9:00 AM - 8:00 PM",
    },
    {
      icon: Mail,
      title: "Email Us",
      subtitle: "support@nirosha.in",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-b border-slate-800 text-slate-300">
      {TOUCHPOINTS.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-center gap-3.5 group">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-shop-orange group-hover:bg-shop-orange group-hover:text-white transition-colors duration-300">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {item.title}
              </h4>
              <p className="text-xs font-medium text-white mt-0.5">
                {item.subtitle}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
