"use client";

import React, { useEffect } from "react";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white overflow-hidden">
      {/* Decorative Cricket Pattern Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 text-9xl">🏏</div>
        <div className="absolute bottom-20 right-20 text-9xl">🏏</div>
        <div className="absolute top-1/3 right-10 text-6xl">🏏</div>
        <div className="absolute bottom-1/3 left-20 text-6xl">🏏</div>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* App Icon */}
        <div className="mb-6 h-24 w-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center text-6xl shadow-2xl border-4 border-white/20 animate-in zoom-in duration-500">
          🏏
        </div>

        {/* App Name */}
        <h1 className="text-5xl font-black tracking-tight mb-3 drop-shadow-2xl animate-in slide-in-from-top duration-700 delay-100">
          HOMEGROUND
        </h1>
        
        {/* Tagline */}
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-emerald-100 mb-8 animate-in fade-in duration-700 delay-200">
          Local Cricket Companion
        </p>

        {/* Description */}
        <p className="text-base leading-relaxed text-white/90 mb-8 font-medium px-4 animate-in fade-in duration-700 delay-300">
          Track your matches with professional scoring. Record stats, manage tournaments, and celebrate victories.
        </p>

        {/* Developer Credit */}
        <div className="bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl p-6 mb-10 w-full shadow-2xl animate-in slide-in-from-bottom duration-700 delay-400">
          <p className="text-[10px] uppercase tracking-widest text-emerald-200 mb-2 font-bold">Developed By</p>
          <h2 className="text-2xl font-black text-white mb-1">Sanjay Yadav</h2>
          <p className="text-sm text-emerald-100 font-semibold">Full Stack Developer</p>
        </div>

        {/* Get Started Button */}
        <button 
          onClick={onFinish}
          className="group relative px-10 py-4 bg-white text-emerald-700 font-black text-lg rounded-full shadow-2xl hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all duration-300 animate-in zoom-in duration-700 delay-500"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 text-emerald-800 font-black transition-opacity duration-300">
            Get Started →
          </span>
        </button>

        {/* Bottom Text */}
        <p className="mt-8 text-xs text-white/60 font-mono animate-in fade-in duration-700 delay-600">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
