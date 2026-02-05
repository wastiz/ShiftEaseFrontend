"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useTranslations } from "next-intl";

export default function HeroHome() {
  const t = useTranslations("landing.hero");

  return (
    <section>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero content */}
        <div className="py-12 md:py-20">
          {/* Section header */}
          <div className="pb-12 text-center md:pb-20">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--text-primary),var(--primary),var(--text-primary),var(--coralPrimary),var(--text-primary))] bg-[length:200%_auto] bg-clip-text pb-5 text-4xl font-semibold text-transparent md:text-5xl lg:text-6xl"
            >
              {t("title")}
              <br />
              {t("titleLine2")}
            </motion.h1>
            <div className="mx-auto max-w-3xl">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 text-xl text-textSecondary"
              >
                {t("description")}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mx-auto max-w-xs sm:flex sm:max-w-none sm:justify-center gap-4"
              >
                <Link
                  href="/sign-in"
                  className="btn-primary group mb-4 w-full sm:mb-0 sm:w-auto flex items-center justify-center"
                >
                  <span className="relative inline-flex items-center">
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all px-6 py-3 w-full sm:w-auto bg-white/5 text-textSecondary border border-white/20 hover:bg-white/10 hover:text-textPrimary"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {t("learnMore")}
                </Link>
              </motion.div>
            </div>
          </div>

          {/* Hero image placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="relative mx-auto max-w-4xl"
          >
            <div className="aspect-video rounded-2xl bg-gradient-to-br from-primary/20 via-glassPrimary to-coralPrimary/10 border border-glassBorder overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                    <Play className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-textSecondary">{t("demoVideo")}</p>
                </div>
              </div>
            </div>
            {/* Decorative glow */}
            <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-primary/20 via-transparent to-coralPrimary/20 blur-2xl opacity-50" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
