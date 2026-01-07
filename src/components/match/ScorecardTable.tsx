"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { BatsmanStats, BowlerStats } from "@/utils/stats";
import { cn } from "@/lib/utils";

interface ScorecardTableProps {
  battingStats: BatsmanStats[];
  bowlingStats: BowlerStats[];
  teamName: string;
  score: { runs: number; wickets: number; overs: string };
  extras: { total: number };
  colorClass: string; // e.g., "bg-blue-500"
}

export default function ScorecardTable({ battingStats, bowlingStats, teamName, score, extras, colorClass }: ScorecardTableProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Filter out batsmen who haven't batted OR keep them as "Did not bat"
  // For this view, usually showing only those who faced a ball or got out is cleaner, 
  // but "Did not bat" lists are standard. 
  // Let's list everyone for completeness but visually distinguish.
  
  // Actually, to keep it clean, show players with balls > 0 or out=true
  const batters = battingStats.filter(p => p.balls > 0 || p.out);
  const didNotBat = battingStats.filter(p => !p.balls && !p.out).map(p => p.name).join(", ");

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Header */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={cn("p-4 flex justify-between items-center cursor-pointer hover:opacity-90 transition-opacity text-white", colorClass)}
      >
        <div>
            <h3 className="font-bold text-lg">{teamName}</h3>
            <p className="text-xs opacity-90 font-mono tracking-wide">
                {score.runs}/{score.wickets} <span className="opacity-75">({score.overs} ov)</span>
            </p>
        </div>
        <div>
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </div>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 duration-300">
           {/* Batting Table - Compact Mobile Layout */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider">
                 <tr>
                    <th className="py-2 px-2 text-[11px] sm:text-xs sm:px-3">Batsman</th>
                    <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">R</th>
                    <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">B</th>
                    <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">4s</th>
                    <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">6s</th>
                    <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">SR</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {batters.map(player => (
                    <tr key={player.id} className="hover:bg-gray-50/50">
                        <td className="py-2 px-2 sm:px-3">
                            <div className="font-semibold text-gray-800 text-xs sm:text-sm leading-tight">
                                {player.name}
                            </div>
                            <div className="text-[10px] sm:text-xs text-gray-400 font-medium truncate max-w-[100px] sm:max-w-[150px] leading-tight mt-0.5">
                                {player.out ? player.dismissal : "not out*"}
                            </div>
                        </td>
                        <td className="py-2 px-1.5 sm:px-2 text-right font-bold text-gray-900 text-xs sm:text-sm">{player.runs}</td>
                        <td className="py-2 px-1.5 sm:px-2 text-right text-gray-600 text-xs sm:text-sm">{player.balls}</td>
                        <td className="py-2 px-1.5 sm:px-2 text-right text-gray-600 text-xs sm:text-sm">{player.fours}</td>
                        <td className="py-2 px-1.5 sm:px-2 text-right text-gray-600 text-xs sm:text-sm">{player.sixes}</td>
                        <td className="py-2 px-1.5 sm:px-2 text-right text-gray-500 font-mono text-[11px] sm:text-xs">{player.strikeRate.toFixed(1)}</td>
                    </tr>
                 ))}
                 {batters.length === 0 && (
                     <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic text-xs sm:text-sm">No batting data yet</td></tr>
                 )}
               </tbody>
             </table>
           </div>
           
           {/* Extras Row */}
           <div className="py-2 px-2 sm:px-3 border-t border-gray-100 flex justify-between items-center bg-gray-50">
               <span className="font-semibold text-gray-600 text-xs sm:text-sm">Extras</span>
               <span className="font-mono font-bold text-gray-800 text-xs sm:text-sm">{extras.total}</span>
           </div>

            {/* Bowling Header */}
           <div className="bg-gray-100/50 py-1.5 px-2 sm:px-3 text-[11px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 border-y border-gray-100">
               Bowling
           </div>

           {/* Bowling Table - Compact Mobile Layout */}
           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead className="text-gray-500 font-medium uppercase tracking-wider">
                    <tr>
                        <th className="py-2 px-2 text-[11px] sm:text-xs sm:px-3">Bowler</th>
                        <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">O</th>
                        <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">M</th>
                        <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">R</th>
                        <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">W</th>
                        <th className="py-2 px-1.5 text-right text-[11px] sm:text-xs sm:px-2">ER</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {bowlingStats.map(bowler => (
                        <tr key={bowler.id} className="hover:bg-gray-50/50">
                            <td className="py-2 px-2 sm:px-3 font-semibold text-gray-800 text-xs sm:text-sm truncate max-w-[100px] sm:max-w-[120px]">{bowler.name}</td>
                            <td className="py-2 px-1.5 sm:px-2 text-right text-gray-800 text-xs sm:text-sm">{bowler.overs}</td>
                            <td className="py-2 px-1.5 sm:px-2 text-right text-gray-500 text-xs sm:text-sm">{bowler.maidens}</td>
                            <td className="py-2 px-1.5 sm:px-2 text-right text-gray-600 text-xs sm:text-sm">{bowler.runs}</td>
                            <td className="py-2 px-1.5 sm:px-2 text-right font-bold text-primary text-xs sm:text-sm">{bowler.wickets}</td>
                            <td className="py-2 px-1.5 sm:px-2 text-right text-gray-500 font-mono text-[11px] sm:text-xs">{bowler.economy.toFixed(1)}</td>
                        </tr>
                    ))}
                    {bowlingStats.length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic text-xs sm:text-sm">No bowling data yet</td></tr>
                    )}
                </tbody>
             </table>
           </div>

           {/* Did Not Bat */}
           {didNotBat && (
               <div className="py-2 px-2 sm:px-3 text-[11px] sm:text-xs text-gray-500 border-t border-gray-100 bg-gray-50/30">
                   <strong className="text-gray-700">Did not bat:</strong> {didNotBat}
               </div>
           )}
        </div>
      )}
    </div>
  );
}
