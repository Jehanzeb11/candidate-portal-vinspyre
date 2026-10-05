"use client"

import { Sparkles, ShieldCheck } from "lucide-react"

interface TeamNoteSidebarProps {
  firstName?: string
}

export function TeamNoteSidebar({ firstName }: TeamNoteSidebarProps) {
  return (
    <div className="w-full space-y-4">
      {/* A little note from us */}
      <div className="bg-[#FBEAF0] rounded-[32px] border border-[#F7DCE6] p-4 sm:p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-pink-100 rounded-full opacity-50" />
        <div className="flex items-center gap-2 text-pink-500 mb-5 text-[10px] font-bold tracking-widest uppercase relative z-10">
          <Sparkles className="h-4 w-4" />
          A little note from us
        </div>
        <h3 className="text-xl font-bold text-[#1a2342] mb-3 leading-tight relative z-10">
          Every great journey starts with a first step.
        </h3>
        <p className="text-sm font-medium text-[#1a2342]/70 mb-6 leading-relaxed relative z-10">
          We're rooting for you{firstName ? `, ${firstName}` : ""}. Take your time and do your best — we're excited to see what you bring.
        </p>

        <div className="flex items-center border-t border-[#F0CEDA] pt-4 gap-3 relative z-10">
          <div className="flex -space-x-3">
            <div className="w-9 h-9 rounded-full bg-[#1a2342] flex items-center justify-center text-[10px] text-white font-bold border-[3px] border-pink-50 z-30">AS</div>
            <div className="w-9 h-9 rounded-full bg-pink-500 flex items-center justify-center text-[10px] text-white font-bold border-[3px] border-pink-50 z-20">JM</div>
            <div className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-[10px] text-pink-700 font-bold border-[3px] border-pink-50 z-10">+3</div>
          </div>
          <div className="text-[11px]">
            <p className="text-[#1a2342]/60 font-medium">Your Vinspyre</p>
            <p className="font-semibold text-[#1a2342]">People Team</p>
          </div>
        </div>
      </div>

      {/* You're in good hands */}
      <div className="bg-[#f8fafc] border border-slate-100 rounded-[24px] p-6 flex gap-4">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100">
          <ShieldCheck className="h-5 w-5 text-slate-400" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-[#1a2342] mb-1">You're in good hands</h4>
          <p className="text-xs font-medium text-slate-500 leading-relaxed">
            Your information is safe and only shared with our hiring team.
          </p>
        </div>
      </div>
    </div>
  )
}
