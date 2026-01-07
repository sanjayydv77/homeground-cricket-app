"use client";

import React, { useMemo } from "react";
import { Match } from "@/contexts/AppContext";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trophy, Calendar, MapPin, Share2 } from "lucide-react";
import { Layout } from "@/components/ui/Layout";
import { calculateMatchStats, calculateManOfTheMatch } from "@/utils/stats";
import ScorecardTable from "./ScorecardTable";
import ManOfTheMatchCard from "./ManOfTheMatchCard";

export default function CompletedMatchView({ match }: { match: Match }) {
  const router = useRouter();

  // Calculate detailed stats
  const stats = useMemo(() => calculateMatchStats(match), [match]);

  // Determine Man of the Match
  const manOfTheMatch = useMemo(() => calculateManOfTheMatch(match, stats), [match, stats]);

  // Identify Teams
  const team1Batting = match.batFirstId === match.team1.id ? match.team1 : match.team2;
  const team2Batting = match.batFirstId === match.team1.id ? match.team2 : match.team1;

  // Determine Result Text if not already set
  let resultText = match.result || "Match Completed";

  return (
    <Layout className="bg-slate-50 pb-20">
      <header className="bg-emerald-600 text-white p-4 shadow-md sticky top-0 z-20 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={() => router.back()} className="p-1 rounded-full hover:bg-white/10">
                 <ArrowLeft className="w-6 h-6" />
             </button>
             <h1 className="font-bold text-lg">Match Summary</h1>
         </div>
         <span className="text-xs bg-white/20 px-2 py-1 rounded text-emerald-100">{match.type}</span>
      </header>
      
      <main className="p-4 space-y-6">
        {/* Result Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm text-center border-t-4 border-emerald-500">
            <div className="inline-flex items-center justify-center p-3 bg-yellow-100 rounded-full mb-3 text-yellow-600">
                <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-emerald-900 mb-2">{resultText}</h2>
            
            <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
               <span className="flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   {match.date ? new Date(match.date).toLocaleDateString() : "Date N/A"}
               </span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span className="flex items-center gap-1">
                   <MapPin className="w-3 h-3" />
                   HomeGround
               </span>
            </div>
        </div>

        {/* Man of the Match */}
        {manOfTheMatch && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ManOfTheMatchCard 
                    player={manOfTheMatch} 
                    // Find team name for the player
                    teamName={
                        match.team1.players.some(p => p.id === manOfTheMatch.playerId) ? match.team1.name : match.team2.name
                    }
                />
            </div>
        )}

        {/* Scorecards */}
        <div className="grid gap-4">
             {/* Innings 1 */}
             <div className="space-y-2">
                 <div className="flex items-center justify-between px-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">1st Innings</span>
                 </div>
                 <ScorecardTable 
                    battingStats={stats.batting1}
                    bowlingStats={stats.bowling1}
                    teamName={team1Batting.name}
                    score={stats.score1}
                    extras={stats.extras1}
                    colorClass="bg-blue-600"
                 />
             </div>

             {/* Innings 2 */}
             <div className="space-y-2">
                 <div className="flex items-center justify-between px-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">2nd Innings</span>
                 </div>
                <ScorecardTable 
                    battingStats={stats.batting2}
                    bowlingStats={stats.bowling2}
                    teamName={team2Batting.name}
                    score={stats.score2}
                    extras={stats.extras2}
                    colorClass="bg-orange-500"
                />
             </div>
        </div>

        {/* Footer Info */}
        <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex items-center gap-3">
            <Share2 className="w-5 h-5 flex-shrink-0 opacity-70" />
            <p>Scorecard generated automatically. You can take a screenshot to share the results.</p>
        </div>
        
      </main>
    </Layout>
  );
}
