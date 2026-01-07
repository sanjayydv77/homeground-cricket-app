"use client";

import React from "react";
import { PlayerPerformance } from "@/utils/stats";
import { Trophy, Star, Medal } from "lucide-react";

interface ManOfTheMatchCardProps {
    player: PlayerPerformance | null;
    teamName?: string;
}

export default function ManOfTheMatchCard({ player, teamName }: ManOfTheMatchCardProps) {
  if (!player) return null;

  // We need player name. But PlayerPerformance currently only has ID.
  // We need to fetch name in parent or pass it down. 
  // Let's assume parent finds the name or we update the util.
  // Actually, I updated the util to return { playerId, points, desc }.
  // Uh oh, I missed adding `name` to the return type in util manually but I can fetch it in component if I have players list.
  // BETTER: Update the util to return name.

  return (
    <div className="bg-gradient-to-r from-purple-800 to-indigo-900 rounded-2xl shadow-lg p-1 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Trophy size={100} />
      </div>
      
      <div className="bg-white/10 backdrop-blur-sm p-5 rounded-xl flex items-center gap-4 relative z-10">
        <div className="relative">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-indigo-200">
                <Star className="text-purple-900 w-8 h-8 fill-purple-900" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white">
                MVP
            </div>
        </div>
        
        <div className="flex-1">
            <h4 className="text-purple-200 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                <Medal className="w-3 h-3" /> Man of the Match
            </h4>
            {/* Name needs to be passed. The util returned ID. I will fix util or pass name prop. */}
            <h2 className="text-white text-xl font-bold leading-tight">{player.name}</h2> 
            {teamName && <p className="text-purple-300 text-xs mb-2">{teamName}</p>}
            
            <div className="inline-block bg-white/20 rounded-lg px-3 py-1 mt-1">
                <p className="text-yellow-300 text-sm font-mono font-bold">
                    {player.desc}
                </p>
                <p className="text-[10px] text-purple-200 opacity-80 mt-0.5">
                    {Math.round(player.points)} fantasy pts
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
