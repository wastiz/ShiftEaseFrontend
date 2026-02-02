"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import useMasonry from "@/hooks/useMasonry";
import { Star, Building2 } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    company: "Retail Chain",
    role: "Store Manager",
    content:
      "ShiftEase has completely transformed how we manage our 50+ employees. Creating weekly schedules used to take hours, now it takes minutes.",
    categories: [1, 2, 5],
  },
  {
    name: "James K.",
    company: "Healthcare",
    role: "HR Director",
    content:
      "The compliance features are a lifesaver. We no longer worry about violating labor laws with our nursing staff schedules.",
    categories: [1, 3, 4],
  },
  {
    name: "Maria L.",
    company: "Restaurant Group",
    role: "Operations Manager",
    content:
      "Our staff loves the mobile app. They can swap shifts, request time off, and see their schedules instantly. Reduced no-shows by 40%.",
    categories: [1, 2, 5],
  },
  {
    name: "David P.",
    company: "Manufacturing",
    role: "Plant Supervisor",
    content:
      "Managing 24/7 operations with rotating shifts was a nightmare before ShiftEase. The automated scheduling considers all our complex rules.",
    categories: [1, 4],
  },
  {
    name: "Emily R.",
    company: "Hospitality",
    role: "Hotel Manager",
    content:
      "The real-time notifications keep our entire team aligned. When someone calls in sick, we can find a replacement within minutes.",
    categories: [1, 3, 5],
  },
  {
    name: "Michael T.",
    company: "Logistics",
    role: "Warehouse Manager",
    content:
      "The analytics dashboard helps us optimize labor costs. We've reduced overtime expenses by 25% while maintaining productivity.",
    categories: [1, 3],
  },
];

const categories = [
  { id: 1, name: "All Reviews" },
  { id: 2, name: "Retail" },
  { id: 3, name: "Healthcare" },
  { id: 4, name: "Enterprise" },
  { id: 5, name: "Hospitality" },
];

export default function Testimonials() {
  const masonryContainer = useMasonry();
  const [category, setCategory] = useState<number>(1);

  return (
    <section id="testimonials">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="border-t border-white/10 py-12 md:py-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center">
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--text-primary),var(--primary),var(--text-primary),var(--tealPrimary),var(--text-primary))] bg-[length:200%_auto] bg-clip-text pb-4 text-3xl font-semibold text-transparent md:text-4xl">
              Trusted by Teams Everywhere
            </h2>
            <p className="text-lg text-textSecondary">
              See how businesses of all sizes use ShiftEase to simplify their
              workforce management and boost employee satisfaction.
            </p>
          </div>

          {/* Category filters */}
          <div className="flex justify-center pb-12 max-md:hidden md:pb-16">
            <div className="relative inline-flex flex-wrap justify-center rounded-2xl bg-white/5 p-1 border border-white/10">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`flex h-8 flex-1 items-center gap-2.5 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    category === cat.id
                      ? "bg-gradient-to-b from-primary/80 to-primary text-white shadow-lg"
                      : "text-textSecondary hover:text-textPrimary"
                  }`}
                  aria-pressed={category === cat.id}
                  onClick={() => setCategory(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial cards */}
          <div
            className="mx-auto grid max-w-sm items-start gap-6 sm:max-w-none sm:grid-cols-2 lg:grid-cols-3"
            ref={masonryContainer}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                viewport={{ once: true }}
                className="group"
              >
                <article
                  className={`relative rounded-2xl bg-gradient-to-br from-white/5 via-transparent to-white/5 p-5 backdrop-blur-sm transition-opacity border border-white/10 hover:border-primary/30 ${
                    !testimonial.categories.includes(category)
                      ? "opacity-30"
                      : ""
                  }`}
                >
                  <div className="flex flex-col gap-4">
                    {/* Company badge */}
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                        <Building2 className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium text-textSecondary">
                        {testimonial.company}
                      </span>
                    </div>

                    {/* Stars */}
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="h-4 w-4 fill-primary text-primary"
                        />
                      ))}
                    </div>

                    {/* Quote */}
                    <p className="text-textSecondary">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    {/* Author */}
                    <div className="flex items-center gap-3 pt-2 border-t border-white/10">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-tealPrimary/30 text-sm font-semibold text-textPrimary">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-textPrimary">
                          {testimonial.name}
                        </div>
                        <div className="text-xs text-textSecondary">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
