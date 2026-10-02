"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import logo from "@/assets/logo.png";

export function ApplyHeader() {
  return (
    <header className="w-full bg-[#D630690D] border-b border-[#E91E8C87]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 md:h-20 h-16 flex items-center justify-between">

        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link href="/" className="shrink-0">
            <Image src={logo} alt="Vinspyre" className="h-8 sm:h-10 w-auto object-contain" />
          </Link>

          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-1.5 text-sm text-slate-500 font-medium">
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Careers</span>
            <ChevronRight className="w-3 h-3 text-slate-700 font-bold mt-1" />
            <span className="hover:text-slate-700 cursor-pointer transition-colors">Apply</span>
          </nav>
        </div>

        {/* Right: Already applied + Login */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 font-semibold hidden sm:block">Already applied?</span>
          <Link
            href="/login"
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#1e293b] hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
          >
            Candidate login
          </Link>
        </div>

      </div>
    </header>
  );
}
