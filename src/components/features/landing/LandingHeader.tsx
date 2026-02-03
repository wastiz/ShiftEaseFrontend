"use client";

import Link from "next/link";
import Logo from "@/components/ui/Logo";

export default function LandingHeader() {
  return (
    <header className="z-30 mt-2 w-full md:mt-5">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="relative flex h-14 items-center justify-between gap-3 rounded-2xl bg-black/60 backdrop-blur-md px-3 border border-white/10">
          {/* Site branding */}
          <div className="flex flex-1 items-center">
            <Logo />
          </div>

          {/* Desktop sign in links */}
          <ul className="flex flex-1 items-center justify-end gap-3">
            <li>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all px-3 py-[7px] bg-transparent text-textSecondary border border-white/20 hover:bg-white/10 hover:text-textPrimary"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link
                href="/sign-in"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all px-3 py-[7px] bg-primary text-white hover:brightness-110"
              >
                Register
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}
