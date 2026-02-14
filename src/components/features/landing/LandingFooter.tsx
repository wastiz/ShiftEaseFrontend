"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";
import { Twitter, Github, Linkedin } from "lucide-react";
import { useTranslations } from "next-intl";

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export default function LandingFooter() {
  const t = useTranslations("landing.footer");

  const footerLinks = {
    product: [
      { name: t("features"), href: "#features" },
      { name: t("pricing"), href: "#pricing" },
      { name: t("integrations"), href: "#integrations" },
      { name: t("changelog"), href: "#changelog" },
    ],
    company: [
      { name: t("aboutUs"), href: "#about" },
      { name: t("careers"), href: "#careers" },
      { name: t("blog"), href: "#blog" },
      { name: t("contact"), href: "#contact" },
    ],
    resources: [
      { name: t("documentation"), href: "#docs" },
      { name: t("helpCenter"), href: "#help" },
      { name: t("apiReference"), href: "#api" },
      { name: t("status"), href: "#status" },
    ],
    legal: [
      { name: t("privacyPolicy"), href: "#privacy" },
      { name: t("termsOfService"), href: "#terms" },
      { name: t("cookiePolicy"), href: "#cookies" },
    ],
  };

  return (
    <footer className="relative">
      {/* Top glow effect */}
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 -z-10 -translate-x-1/2"
        aria-hidden="true"
      >
        <div
          className="h-[300px] w-[600px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(ellipse at center, var(--primary) 0%, transparent 70%)",
            opacity: 0.1,
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-white/10">
          {/* Main footer content */}
          <div className="grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <div className="mb-4">
                <Logo />
              </div>
              <p className="mb-4 text-sm text-textSecondary">
                {t("description")}
              </p>
              {/* Social links */}
              <ul className="flex gap-2">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-textSecondary transition-colors hover:bg-primary/20 hover:text-primary border border-white/10"
                      aria-label={social.name}
                    >
                      <social.icon className="h-4 w-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Product links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-textPrimary">
                {t("product")}
              </h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-textSecondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-textPrimary">
                {t("company")}
              </h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-textSecondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-textPrimary">
                {t("resources")}
              </h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.resources.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-textSecondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-textPrimary">
                {t("legal")}
              </h3>
              <ul className="space-y-2 text-sm">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-textSecondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-white/10 py-6">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-sm text-textSecondary">
                &copy; {new Date().getFullYear()} ShiftEase. {t("copyright")}
              </p>
              <p className="text-sm text-textSecondary">
                {t("madeWith")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
