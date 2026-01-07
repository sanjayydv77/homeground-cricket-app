"use client";

import React, { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { Search, Plus, Info, X, Github, Linkedin, Instagram, MessageCircle } from "lucide-react";
import { useApp, Match } from "@/contexts/AppContext";
import Link from "next/link";
import { getDaysRemaining } from "@/utils/cleanup";

export default function HomeScreen() {
  const { matches, isLoading } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAbout, setShowAbout] = useState(false);

  const liveMatches = matches.filter((m) => m.status === "Live");
  const completedMatches = matches.filter((m) => m.status === "Completed");

  if (isLoading) {
      return (
          <Layout className="flex items-center justify-center min-h-screen">
              <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="text-gray-500 font-medium">Loading Matches...</p>
              </div>
          </Layout>
      )
  }

  // TODO: Implement actual search filtering logic based on series/tournament/code
  const filteredLive = liveMatches.filter(m => m.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.includes(searchTerm));
  const filteredCompleted = completedMatches.filter(m => m.team1.name.toLowerCase().includes(searchTerm.toLowerCase()) || m.code.includes(searchTerm));

  return (
    <Layout className="pb-20">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                {/* Logo Placeholder */}
                <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-primary font-bold shadow-inner flex-shrink-0">
                {/* Simple Bat/Ball Icon representation */}
                <div className="relative w-7 h-7">
                    <div className="absolute inset-0 bg-secondary w-1.5 h-full left-1/2 -rotate-12 transform origin-bottom rounded-sm"></div>
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white"></div>
                </div>
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight leading-none text-white drop-shadow-sm">HOMEGROUND</h1>
                  <div className="flex items-center gap-1.5 mt-1 bg-black/20 px-3 py-1 rounded-full w-fit backdrop-blur-sm border border-white/10 hover:bg-black/30 transition-colors cursor-default">
                        <span className="text-yellow-300 text-xs">⚡</span>
                        <p className="text-[10px] font-bold text-white tracking-widest uppercase">
                            By Sanjay Yadav
                        </p>
                    </div>
                </div>
            </div>
            
            <button 
                onClick={() => setShowAbout(true)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors active:scale-95"
            >
                <Info className="w-6 h-6 text-white" />
            </button>
        </div>
      </header>

      {/* Search Section with Glassmorphism */}
      <div className="p-4 sticky top-0 z-20">
        <div className="relative backdrop-blur-[12px] bg-white/10 rounded-2xl p-3 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search matches, series, code..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent transition-all text-gray-800 placeholder:text-gray-500 font-medium"
            style={{ WebkitBackdropFilter: 'blur(8px)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="px-4 space-y-6">
        {/* Live Matches with Glassmorphism Container */}
        <section className="backdrop-blur-[10px] bg-white/10 rounded-2xl p-4 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              Live Matches
            </h2>
          </div>
          
          <div className="space-y-3">
            {filteredLive.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-4 italic font-medium">No live matches currently.</p>
            ) : (
                filteredLive.map(match => (
                    <MatchCard key={match.id} match={match} />
                ))
            )}
          </div>
        </section>

        {/* Completed Matches with Glassmorphism Container */}
        <section className="backdrop-blur-[10px] bg-white/10 rounded-2xl p-4 border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.12)]" style={{ WebkitBackdropFilter: 'blur(10px)' }}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Completed Matches</h2>
          <div className="space-y-3">
             {filteredCompleted.length === 0 ? (
              <p className="text-gray-700 text-sm text-center py-4 italic font-medium">No completed matches found.</p>
            ) : (
                filteredCompleted.map(match => (
                    <MatchCard key={match.id} match={match} />
                ))
            )}
          </div>
        </section>
      </div>

      {/* Floating Action Button */}
      <Link href="/match/create">
        <button className="fixed bottom-6 right-6 h-14 w-14 bg-accent text-accent-foreground rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform z-30">
          <Plus className="h-8 w-8" />
        </button>
      </Link>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </Layout>
  );
}

function AboutModal({ onClose }: { onClose: () => void }) {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
             <div className="bg-white w-full max-w-sm rounded-[2rem] p-6 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
                 {/* Decorative background circle */}
                 <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-10 -mt-10 pointer-events-none"></div>
                 
                 <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors z-10">
                     <X className="w-5 h-5 text-gray-600" />
                 </button>

                 <div className="flex flex-col items-center text-center mt-2">
                     <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-4xl shadow-inner border border-primary/20">
                         🏏
                     </div>
                     <h2 className="text-2xl font-black text-primary mb-1">HOMEGROUND</h2>
                     <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Local Cricket Companion</p>
                     
                     <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200 w-full mb-6 shadow-sm">
                         <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">DEVELOPED BY</p>
                         <h3 className="text-xl font-bold text-gray-800">Sanjay Yadav</h3>
                         <p className="text-sm text-primary font-medium mt-1">Full Stack Developer</p>
                     </div>

                     <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                         HomeGround brings professional scoring to your local matches. Track stats, tournaments, and series with ease.
                     </p>
                     
                     <div className="flex gap-3 justify-center w-full">
                         {/* Social Links */}
                         <a href="https://github.com/sanjayydv77" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-gray-800 transition-all duration-300 group">
                            <Github className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                         </a>
                         
                         <a href="https://www.linkedin.com/in/sanjuydv7/" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#0077b5] transition-all duration-300 group">
                            <Linkedin className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                         </a>

                         <a href="https://instagram.com/sanjuydv_7" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#E1306C] transition-all duration-300 group">
                            <Instagram className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                         </a>

                         <a href="https://wa.me/917869962336" target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 border border-slate-100 rounded-xl hover:bg-[#25D366] transition-all duration-300 group">
                            <MessageCircle className="w-5 h-5 text-gray-700 group-hover:text-white group-hover:scale-110 transition-all" />
                         </a>
                     </div>
                     
                     <div className="mt-8 text-[10px] text-gray-400 font-mono">
                         v1.0.0 • © 2026 HomeGround
                     </div>
                 </div>
             </div>
        </div>
    )
}

function MatchCard({ match }: { match: Match }) {
    // Determine status text
    let statusText = "Toss";
    let statusColor = "text-primary";
    
    if (match.status === "Completed") {
        if (!match.batFirstId) {
             statusText = "Completed";
        } else {
            const teamBat1 = match.batFirstId === match.team1.id ? match.team1 : match.team2;
            const teamBat2 = match.batFirstId === match.team1.id ? match.team2 : match.team1;
            
            const getVals = (inning: 1 | 2) => {
                const balls = match.history.filter(b => b.inning === inning);
                const runs = balls.reduce((s, b) => s + b.runs + b.extras, 0);
                const wkts = balls.filter(b => b.isWicket).length;
                return { runs, wkts };
            };

            const s1 = getVals(1);
            const s2 = getVals(2);

            if (s1.runs > s2.runs) {
                statusText = `${teamBat1.name} won by ${s1.runs - s2.runs} runs`;
            } else if (s2.runs > s1.runs) {
                const totalWickets = match.teamSize || 11;
                // "won by X wickets" means how many wickets they had LEFT in hand
                // i.e. total allowed wickets - wickets lost
                // We define result by wickets usually as (10 - wicketsLost) or (teamSize - wicketsLost - 1)? 
                // Standard: "won by 4 wickets" means they lost 6 (if 10 wkt game).
                // So (TeamSize - 1) - wicketsLost ?? usually it is (11 players -> 10 wickets). 
                // Let's assume teamSize is number of players. So wickets available is (teamSize - 1) usually... 
                // wait, 11 players = 10 wickets. No, if you have 5 players, you have 4 wickets.
                // But in gully cricket, maybe all bat?
                // Let's stick safe: (teamSize ?? 11) - 1 - s2.wkts. 
                // Actually standard is (10 - wickets lost). 
                // Let's try to infer if we can. If not, just show score.
                // Simpler: show the score and "Won" text.
                // "Team 2 won (Score)"
                statusText = `${teamBat2.name} won (${s2.runs}/${s2.wkts})`;
            } else {
                statusText = "Match Tied";
            }
        }
        statusColor = "text-green-600";
        
        // Expiry Notice
        const remaining = getDaysRemaining(match.completedAt);
        if (remaining !== null && remaining <= 7) {
             statusText += ` (Exp: ${remaining}d)`;
        }
    } else if (match.currentInnings) {
        // Calculate current score
        const history = match.history || [];
        const currentBalls = match.currentInnings === 1 
            ? history.filter(b => b.inning === 1) 
            : history.filter(b => b.inning === 2);
        
        const score = currentBalls.reduce((s, b) => s + b.runs + b.extras, 0);
        const wickets = currentBalls.filter(b => b.isWicket).length;
        const validBalls = currentBalls.filter(b => !b.isWide && !b.isNoBall).length;
        const overs = `${Math.floor(validBalls / 6)}.${validBalls % 6}`;
        
        // Batting team name
        const batTeamId = match.currentInnings === 1 
             ? match.batFirstId 
             : (match.batFirstId === match.team1.id ? match.team2.id : match.team1.id);
        const batTeam = batTeamId === match.team1.id ? match.team1 : match.team2;

        statusText = `${batTeam?.name}: ${score}/${wickets} (${overs})`;
    }

    return (
        <Link href={`/match/${match.id}`}>
            <div className="backdrop-blur-[12px] bg-white/15 p-4 rounded-xl border border-white/25 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)] flex flex-col gap-2 hover:bg-white/25 hover:shadow-[0_12px_40px_0_rgba(0,0,0,0.15)] hover:scale-[1.02] transition-all duration-300 cursor-pointer" style={{ WebkitBackdropFilter: 'blur(12px)' }}>
                <div className="flex justify-between items-center text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <span>{match.type}</span>
                    <span>#{match.code}</span>
                </div>
                <div className="flex justify-between items-center font-semibold text-secondary">
                    <span className="truncate max-w-[40%] text-gray-800 font-bold">{match.team1.name}</span>
                    <span className="text-sm font-bold text-gray-500">VS</span>
                    <span className="truncate max-w-[40%] text-gray-800 font-bold">{match.team2.name}</span>
                </div>
                <div className={`text-sm text-center font-medium mt-1 bg-white/30 backdrop-blur-sm py-1.5 rounded-lg ${statusColor} border border-white/20`} style={{ WebkitBackdropFilter: 'blur(6px)' }}>
                    {statusText}
                </div>
            </div>
        </Link>
    )
}
