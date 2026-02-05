"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Cta() {
  const t = useTranslations("landing.cta");

  return (
    <section className="relative overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -mb-24 ml-20 -translate-x-1/2"
        aria-hidden="true"
      >
        <div
          className="h-[500px] w-[700px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
            opacity: 0.15,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="py-12 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 via-transparent to-primary/5 p-8 md:p-12 overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 h-32 w-32 rounded-full bg-coralPrimary/20 blur-3xl" />

            <div className="relative mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {t("badge")}
                </span>
              </div>

              <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--text-primary),var(--primary),var(--text-primary),var(--coralPrimary),var(--text-primary))] bg-[length:200%_auto] bg-clip-text pb-4 text-3xl font-semibold text-transparent md:text-4xl">
                {t("title")}
              </h2>

              <p className="mb-8 text-lg text-textSecondary">
                {t("subtitle")}
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/sign-in"
                  className="btn-primary group flex items-center justify-center"
                >
                  <span className="relative inline-flex items-center">
                    {t("button")}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
