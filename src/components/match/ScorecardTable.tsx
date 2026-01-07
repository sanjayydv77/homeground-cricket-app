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
           {/* Batting Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                 <tr>
                    <th className="p-3">Batsman</th>
                    <th className="p-3 text-right">R</th>
                    <th className="p-3 text-right">B</th>
                    <th className="p-3 text-right hidden sm:table-cell">4s</th>
                    <th className="p-3 text-right hidden sm:table-cell">6s</th>
                    <th className="p-3 text-right">SR</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {batters.map(player => (
                    <tr key={player.id} className="hover:bg-gray-50/50">
                        <td className="p-3">
                            <div className="font-semibold text-gray-800 flex items-center gap-2">
                                {player.name}
                                {!player.out && <span className="text-green-600 text-[10px] font-bold px-1.5 py-0.5 bg-green-50 rounded-full">NOT OUT</span>}
                            </div>
                            <div className="text-xs text-gray-400 font-medium truncate max-w-[150px]">
                                {player.out ? player.dismissal : "not out*"}
                            </div>
                        </td>
                        <td className="p-3 text-right font-bold text-gray-900">{player.runs}</td>
                        <td className="p-3 text-right text-gray-600">{player.balls}</td>
                        <td className="p-3 text-right text-gray-600 hidden sm:table-cell">{player.fours}</td>
                        <td className="p-3 text-right text-gray-600 hidden sm:table-cell">{player.sixes}</td>
                        <td className="p-3 text-right text-gray-500 font-mono text-xs">{player.strikeRate.toFixed(1)}</td>
                    </tr>
                 ))}
                 {batters.length === 0 && (
                     <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">No batting data yet</td></tr>
                 )}
               </tbody>
             </table>
           </div>
           
           {/* Extras Row */}
           <div className="p-3 border-t border-gray-100 flex justify-between items-center text-sm bg-gray-50">
               <span className="font-semibold text-gray-600">Extras</span>
               <span className="font-mono font-bold text-gray-800">{extras.total}</span>
           </div>

            {/* Bowling Header */}
           <div className="bg-gray-100/50 p-2 px-3 text-xs font-bold text-gray-500 uppercase tracking-wider mt-1 border-y border-gray-100">
               Bowling
           </div>

           {/* Bowling Table */}
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="text-gray-500 font-medium text-xs uppercase tracking-wider">
                    <tr>
                        <th className="p-3 w-1/3">Bowler</th>
                        <th className="p-3 text-right">O</th>
                        <th className="p-3 text-right">M</th>
                        <th className="p-3 text-right">R</th>
                        <th className="p-3 text-right">W</th>
                        <th className="p-3 text-right">Econ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {bowlingStats.map(bowler => (
                        <tr key={bowler.id} className="hover:bg-gray-50/50">
                            <td className="p-3 font-semibold text-gray-800 truncate max-w-[120px]">{bowler.name}</td>
                            <td className="p-3 text-right text-gray-800">{bowler.overs}</td>
                            <td className="p-3 text-right text-gray-500">{bowler.maidens}</td>
                            <td className="p-3 text-right text-gray-600">{bowler.runs}</td>
                            <td className="p-3 text-right font-bold text-primary">{bowler.wickets}</td>
                            <td className="p-3 text-right text-gray-500 font-mono text-xs">{bowler.economy.toFixed(1)}</td>
                        </tr>
                    ))}
                    {bowlingStats.length === 0 && (
                        <tr><td colSpan={6} className="p-4 text-center text-gray-400 italic">No bowling data yet</td></tr>
                    )}
                </tbody>
             </table>
           </div>

           {/* Did Not Bat */}
           {didNotBat && (
               <div className="p-3 text-xs text-gray-500 border-t border-gray-100 bg-gray-50/30">
                   <strong className="text-gray-700">Did not bat:</strong> {didNotBat}
               </div>
           )}
        </div>
      )}
    </div>
  );
}
