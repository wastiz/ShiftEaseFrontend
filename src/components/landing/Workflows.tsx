"use client";

import { motion } from "framer-motion";
import Spotlight from "./Spotlight";
import { Calendar, Users, Clock, ArrowRight } from "lucide-react";

const workflows = [
  {
    icon: Calendar,
    tag: "Smart Scheduling",
    description:
      "Create optimized schedules automatically based on employee availability, skills, and labor laws compliance.",
  },
  {
    icon: Users,
    tag: "Team Management",
    description:
      "Manage your entire workforce from one dashboard. Track hours, skills, and performance effortlessly.",
  },
  {
    icon: Clock,
    tag: "Time Tracking",
    description:
      "Employees can clock in/out, request time off, and manage their preferences all in one place.",
  },
];

export default function Workflows() {
  return (
    <section id="workflows">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="pb-12 md:pb-20">
          {/* Section header */}
          <div className="mx-auto max-w-3xl pb-12 text-center md:pb-20">
            <div className="inline-flex items-center gap-3 pb-3 before:h-px before:w-8 before:bg-gradient-to-r before:from-transparent before:to-primary/50 after:h-px after:w-8 after:bg-gradient-to-l after:from-transparent after:to-primary/50">
              <span className="inline-flex bg-gradient-to-r from-primary to-tealPrimary bg-clip-text text-transparent text-sm font-medium">
                Tailored Workflows
              </span>
            </div>
            <h2 className="animate-[gradient_6s_linear_infinite] bg-[linear-gradient(to_right,var(--text-primary),var(--primary),var(--text-primary),var(--tealPrimary),var(--text-primary))] bg-[length:200%_auto] bg-clip-text pb-4 text-3xl font-semibold text-transparent md:text-4xl">
              Streamline Your Scheduling Process
            </h2>
            <p className="text-lg text-textSecondary">
              Simple and elegant interface to start managing your team&apos;s schedules
              in minutes. Integrates seamlessly with your existing workflow.
            </p>
          </div>

          {/* Spotlight cards */}
          <Spotlight className="group mx-auto grid max-w-sm items-start gap-6 lg:max-w-none lg:grid-cols-3">
            {workflows.map((workflow, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group/card relative h-full overflow-hidden rounded-2xl bg-card/30 p-px before:pointer-events-none before:absolute before:-left-40 before:-top-40 before:z-10 before:h-80 before:w-80 before:translate-x-[var(--mouse-x)] before:translate-y-[var(--mouse-y)] before:rounded-full before:bg-primary/60 before:opacity-0 before:blur-3xl before:transition-opacity before:duration-500 after:pointer-events-none after:absolute after:-left-48 after:-top-48 after:z-30 after:h-64 after:w-64 after:translate-x-[var(--mouse-x)] after:translate-y-[var(--mouse-y)] after:rounded-full after:bg-primary after:opacity-0 after:blur-3xl after:transition-opacity after:duration-500 hover:after:opacity-20 group-hover:before:opacity-100"
              >
                <div className="relative z-20 h-full overflow-hidden rounded-[inherit] bg-background border border-glassBorder">
                  {/* Arrow indicator */}
                  <div
                    className="absolute right-6 top-6 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-textPrimary opacity-0 transition-opacity group-hover/card:opacity-100"
                    aria-hidden="true"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </div>

                  {/* Icon area */}
                  <div className="p-6 pb-0">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <workflow.icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-3">
                      <span className="inline-flex rounded-full bg-white/5 px-3 py-1 text-xs font-medium border border-white/10">
                        <span className="bg-gradient-to-r from-primary to-tealPrimary bg-clip-text text-transparent">
                          {workflow.tag}
                        </span>
                      </span>
                    </div>
                    <p className="text-textSecondary">
                      {workflow.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </Spotlight>
        </div>
      </div>
    </section>
  );
}
