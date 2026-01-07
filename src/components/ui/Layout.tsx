import React from "react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className="min-h-screen w-full bg-slate-900 relative overflow-x-hidden">
      {/* Background Image Layer - Clear and Visible */}
      <div 
        className="fixed inset-0 z-0 bg-cricket-pattern bg-cover bg-center bg-no-repeat"
        aria-hidden="true"
      />
      {/* Dark Overlay for Better Text Contrast */}
      <div 
        className="fixed inset-0 z-[1] bg-black/20"
        aria-hidden="true"
      />
      {/* Light Frosted Overlay - Minimal to Keep Background Visible */}
      <div 
        className="fixed inset-0 z-[2] bg-white/5"
        aria-hidden="true"
      />
      
      {/* Content Layer */}
      <div className={cn("relative z-10 min-h-screen flex flex-col", className)}>
        {children}
        
        {/* Founder Footer */}
        <footer className="mt-auto py-8 text-center text-gray-500 text-sm bg-gradient-to-t from-slate-100 to-transparent">
            <div className="inline-flex flex-col items-center gap-1 p-4 rounded-xl">
                 <p className="font-bold text-gray-700 flex items-center gap-2">
                    Developed with <span className="text-red-500 animate-pulse">❤️</span> by Sanjay Yadav
                 </p>
                 <p className="text-xs opacity-70 font-mono">HomeGround © 2026</p>
                 <div className="flex gap-4 mt-2">
                     {/* Optional Social Links - Placeholders */}
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                     <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                 </div>
            </div>
        </footer>
      </div>
    </div>
  );
}
