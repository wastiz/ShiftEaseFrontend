"use client";

import {
  LandingHeader,
  HeroHome,
  Workflows,
  Features,
  Testimonials,
  Cta,
  LandingFooter,
  PageIllustration,
} from "@/components/landing";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <PageIllustration />
      <LandingHeader />
      <main>
        <HeroHome />
        <Workflows />
        <Features />
        {/*<Testimonials />*/}
        <Cta />
      </main>
      <LandingFooter />
    </div>
  );
}
