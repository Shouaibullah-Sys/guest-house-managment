// components/home/StatsSection.tsx
"use client";

import { motion } from "framer-motion";
import {
  Hotel,
  Users,
  Star,
  Award,
  Globe,
  Heart,
  Calendar,
  Sparkles,
} from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";

const stats = [
  {
    icon: <Hotel className="w-4 h-4" />,
    value: 156,
    label: "Luxury Hotels",
    suffix: "+",
    delay: 0.1,
  },
  {
    icon: <Users className="w-4 h-4" />,
    value: 52487,
    label: "Happy Guests",
    suffix: "+",
    delay: 0.2,
  },
  {
    icon: <Star className="w-4 h-4" />,
    value: 4.92,
    label: "Guest Rating",
    suffix: "/5",
    delay: 0.3,
    decimalPlaces: 2,
  },
  {
    icon: <Award className="w-4 h-4" />,
    value: 28,
    label: "Awards Won",
    suffix: "+",
    delay: 0.4,
  },
  {
    icon: <Globe className="w-4 h-4" />,
    value: 42,
    label: "Countries",
    suffix: "+",
    delay: 0.5,
  },
  {
    icon: <Heart className="w-4 h-4" />,
    value: 98,
    label: "Satisfaction",
    suffix: "%",
    delay: 0.6,
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    value: 15,
    label: "Years Excellence",
    suffix: "+",
    delay: 0.7,
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    value: 250,
    label: "Exclusive Suites",
    suffix: "+",
    delay: 0.8,
  },
];

export default function StatsSection() {
  return (
    <section className="py-12 md:py-16 relative overflow-hidden" id="stats">
      {/* Simple background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-amber-50/20 to-white dark:from-gray-900 dark:to-gray-950">
        {/* Subtle pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(245, 158, 11, 0.2) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      <div className="container mx-auto px-4">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/5 to-amber-600/5 border border-amber-200/20 dark:border-amber-800/20 mb-3">
            <Sparkles className="h-3 w-3 text-amber-500" />
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              EXCELLENCE
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
              Luxury by Numbers
            </span>
          </h2>

          <p className="text-gray-600 dark:text-gray-300 max-w-lg mx-auto text-sm">
            Trusted by discerning travelers worldwide
          </p>
        </motion.div>

        {/* Compact Stats Grid - Single line design */}
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              className="group relative"
            >
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-amber-100 dark:border-gray-700 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-all duration-200">
                {/* Icon */}
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/10 to-amber-600/10 mb-2">
                  <div className="text-amber-600 dark:text-amber-400">
                    {stat.icon}
                  </div>
                </div>

                {/* Number and label in one line */}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent">
                    <NumberTicker
                      value={stat.value}
                      direction="up"
                      delay={stat.delay}
                      decimalPlaces={stat.decimalPlaces || 0}
                      className="text-lg md:text-xl"
                    />
                    {stat.suffix}
                  </span>
                </div>

                <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simple decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-8 h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-amber-300 to-transparent"
        />
      </div>
    </section>
  );
}
