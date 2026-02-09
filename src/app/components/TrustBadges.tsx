import { ShieldCheck, Award, Zap } from 'lucide-react';

export function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: "ISO 9001:2015",
      subtitle: "Certified Quality"
    },
    {
      icon: Award,
      title: "FDA Compliance",
      subtitle: "Medical Grade"
    },
    {
      icon: Zap,
      title: "UL / CSA / IEC",
      subtitle: "Safety Approved"
    }
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 mt-8 opacity-70 hover:opacity-100 transition-opacity">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex items-center gap-3 px-4 py-2 bg-white/50 dark:bg-black/20 rounded-full border border-white/20 backdrop-blur-sm">
          <badge.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-none">{badge.title}</span>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 leading-none mt-0.5">{badge.subtitle}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
