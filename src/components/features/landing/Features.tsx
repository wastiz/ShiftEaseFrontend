"use client";

import { motion } from "framer-motion";
import {
  CalendarCheck,
  Bell,
  BarChart3,
  Shield,
  Smartphone,
  Zap,
} from "lucide-react";
import { useTranslations } from "next-intl";

export default function Features() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: CalendarCheck,
      title: t("smartScheduling.title"),
      description: t("smartScheduling.description"),
    },
    {
      icon: Bell,
      title: t("realTimeNotifications.title"),
      description: t("realTimeNotifications.description"),
    },
    {
      icon: BarChart3,
      title: t("analyticsDashboard.title"),
      description: t("analyticsDashboard.description"),
    },
    {
      icon: Shield,
      title: t("complianceReady.title"),
      description: t("complianceReady.description"),
    },
    {
      icon: Smartphone,
      title: t("mobileSupport.title"),
      description: t("mobileSupport.description"),
    },
    {
      icon: Zap,
      title: t("quickSetup.title"),
      description: t("quickSetup.description"),
    },
  ];

  return (
    <section id="features" className="relative">
      {/* Background decoration */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 -mt-20 -translate-x-1/2 opacity-50"
        aria-hidden="true"
      >
        <div
          className="h-[500px] w-[700px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
            opacity: 0.1,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-white/10 py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-4 text-center md:pb-12">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-primary/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-primary/50">
              <span className="inline-flex bg-primary from-primary to-coralPrimary bg-clip-text text-transparent text-sm font-medium">
                {t("badge")}
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--text-primary),var(--primary),var(--text-primary),var(--coralPrimary),var(--text-primary))] bg-[length:200%_auto] bg-clip-text pb-4 text-3xl font-semibold text-transparent md:text-4xl">
              {t("title")}
            </h2>
            <p className="text-lg text-textSecondary">
              {t("subtitle")}
            </p>
          </div>

          {/* Features grid */}
          <div className="mx-auto grid max-w-sm gap-12 sm:max-w-none sm:grid-cols-2 md:gap-x-14 md:gap-y-16 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-1 text-base font-semibold text-textPrimary">
                  {feature.title}
                </h3>
                <p className="text-textSecondary">{feature.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
