"use client";

import React, { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Trophy, Users, AlertCircle } from "lucide-react";
import { useApp, Tournament, TournamentTeam, Player, PlayerRole } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export default function CreateTournament() {
  const router = useRouter();
  const { addTournament } = useApp();

  const [step, setStep] = useState(1);
  const [tournamentName, setTournamentName] = useState("");
  const [numTeams, setNumTeams] = useState<number | "">("");
  const [teamSize, setTeamSize] = useState<number | "">("");
  const [overs, setOvers] = useState<number | "">("");
  // const [totalMatches, setTotalMatches] = useState(0); // Informational - unused

  // Array of teams
  const [teams, setTeams] = useState<Partial<TournamentTeam>[]>([]);
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);

  const initializePlayers = (size: number) => {
    return Array.from({ length: size }).map((_, i) => ({
      id: Math.random().toString(36).substring(7),
      name: "",
      role: "All-rounder" as PlayerRole,
    }));
  };

  const handleNextStep1 = () => {
    if (!tournamentName.trim()) { alert("Please enter a tournament name"); return; }
    if (!numTeams || !teamSize || !overs) { alert("Please fill all fields"); return; }
    if (numTeams < 4 || numTeams > 16) { alert("Number of teams must be between 4 and 16"); return; }
    if (teamSize < 7 || teamSize > 15) { alert("Team size must be between 7 and 15"); return; }
    
    // Initialize teams array placeholders
    const initTeams: Partial<TournamentTeam>[] = Array.from({ length: numTeams }).map((_, i) => ({
        id: Math.random().toString(36).substring(7),
        name: "", 
        players: initializePlayers(teamSize),
        stats: { played: 0, won: 0, lost: 0, tied: 0, nr: 0, points: 0, nrr: 0, runsScored: 0, oversFaced: 0, runsConceded: 0, oversBowled: 0 }
    }));
    
    setTeams(initTeams);
    setStep(2); // Goes to Team Entry Loop
  };

  const validateTeam = (team: Partial<TournamentTeam>) => {
      if (!team.name?.trim()) return "Team name is required";
      const keepers = team.players?.filter(p => p.role === "Keeper").length || 0;
      if (keepers !== 1) return "Team must have exactly 1 Keeper";
      if (team.players?.some(p => !p.name.trim())) return "All players must have names";
      return null;
  };

  const handleSaveTeam = () => {
    const currentTeam = teams[currentTeamIndex];
    const error = validateTeam(currentTeam);
    if (error) { alert(error); return; }
    
    // Fix Keeper ID reference
    const keeper = currentTeam.players?.find(p => p.role === 'Keeper');
    const updatedTeam = { ...currentTeam, keeperId: keeper?.id };
    
    const newTeams = [...teams];
    newTeams[currentTeamIndex] = updatedTeam;
    setTeams(newTeams);

    if (typeof numTeams === 'number' && currentTeamIndex < numTeams - 1) {
        setCurrentTeamIndex(currentTeamIndex + 1);
        // Scroll to top
        window.scrollTo(0, 0);
    } else {
        // Finish
        handleCreateTournament(newTeams as TournamentTeam[]);
    }
  };

  const handleCreateTournament = (finalTeams: TournamentTeam[]) => {
      const tournamentId = Math.random().toString(36).substring(7);
      const code = Math.floor(1000 + Math.random() * 9000).toString();

      const newTournament: Tournament = {
          id: tournamentId,
          code: code,
          name: tournamentName,
          teamSize: Number(teamSize),
          oversPerInnings: Number(overs),
          teams: finalTeams,
          matchIds: [],
          status: "League",
          knockoutMatches: {}
      };

      addTournament(newTournament);
      router.push(`/tournament/${tournamentId}`);
  };

  const updateCurrentTeamName = (name: string) => {
      const newTeams = [...teams];
      newTeams[currentTeamIndex] = { ...newTeams[currentTeamIndex], name };
      setTeams(newTeams);
  };

  const updatePlayer = (pIndex: number, field: keyof Player, value: any) => {
      const newTeams = [...teams];
      const players = [...(newTeams[currentTeamIndex].players || [])];
      players[pIndex] = { ...players[pIndex], [field]: value };
      newTeams[currentTeamIndex] = { ...newTeams[currentTeamIndex], players };
      setTeams(newTeams);
  }

  const handleBack = () => {
    if (step === 2 && currentTeamIndex > 0) {
        setCurrentTeamIndex(currentTeamIndex - 1);
        window.scrollTo(0, 0);
    } else if (step > 1) {
        setStep(step - 1);
    } else {
        router.back();
    }
  };

  return (
    <Layout>
         <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
            <button onClick={handleBack} className="text-gray-600">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
                <h1 className="text-xl font-bold text-secondary">
                    {step === 1 ? "Tournament Setup" : `Setup Team ${currentTeamIndex + 1} of ${numTeams}`}
                </h1>
                <div className="flex gap-1 mt-1">
                    <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                    <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                </div>
            </div>
        </header>

        <main className="p-4 pb-20 max-w-2xl mx-auto">
            {step === 1 && (
                <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tournament Name</label>
                        <input 
                            type="text" 
                            value={tournamentName} 
                            onChange={e => setTournamentName(e.target.value)} 
                            className="w-full p-3 border rounded-xl text-black"
                            placeholder="e.g. IPL 2026"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Number of Teams</label>
                            <input 
                                type="number" min="4" max="16"
                                value={numTeams} 
                                onChange={e => setNumTeams(e.target.value === "" ? "" : parseInt(e.target.value))} 
                                className="w-full p-3 border rounded-xl text-black"
                            />
                            <p className="text-xs text-gray-500 mt-1">Min 4, Max 16</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Players per Team</label>
                            <input 
                                type="number" min="7" max="15"
                                value={teamSize} 
                                onChange={e => setTeamSize(e.target.value === "" ? "" : parseInt(e.target.value))} 
                                className="w-full p-3 border rounded-xl text-black"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Overs Per Innings</label>
                        <input 
                            type="number" min="1"
                            value={overs} 
                            onChange={e => setOvers(e.target.value === "" ? "" : parseInt(e.target.value))} 
                            className="w-full p-3 border rounded-xl text-black"
                        />
                    </div>
                    
                    <button onClick={handleNextStep1} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg mt-4">
                        Next: Configure Teams
                    </button>
                </div>
            )}

            {step === 2 && teams[currentTeamIndex] && (
                 <div className="space-y-4 animate-in slide-in-from-right-8 fade-in">
                    <div className="bg-white p-4 rounded-xl shadow-sm">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Team Name</label>
                        <input 
                            type="text" 
                            value={teams[currentTeamIndex].name} 
                            onChange={e => updateCurrentTeamName(e.target.value)} 
                            className="w-full p-3 border rounded-xl text-black font-bold text-lg" 
                        />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>Assign exactly <strong>ONE Keeper</strong>.</p>
                    </div>

                    <div className="space-y-3">
                        {teams[currentTeamIndex].players?.map((player, idx) => (
                            <PlayerInput 
                                key={idx} 
                                index={idx} 
                                player={player} 
                                onChange={updatePlayer} 
                            />
                        ))}
                    </div>

                    <div className="sticky bottom-4 pt-4 bg-gradient-to-t from-slate-100 to-transparent">
                        <button onClick={handleSaveTeam} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                            {typeof numTeams === 'number' && currentTeamIndex === numTeams - 1 ? "Create Tournament" : "Next Team"} <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                 </div>
            )}
        </main>
    </Layout>
  );
}

function PlayerInput({ index, player, onChange }: { index: number, player: Player, onChange: (idx: number, f: keyof Player, v: any) => void }) {
    const roles: PlayerRole[] = ["Batsman", "Bowler", "All-rounder", "Keeper"];
    return (
        <div className="bg-white p-3 rounded-lg shadow-sm border flex flex-col gap-2">
             <div className="flex items-center gap-2">
                 <span className="text-xs font-mono text-gray-400 w-6">#{index + 1}</span>
                 <input 
                    type="text" 
                    value={player.name} 
                    onChange={(e) => onChange(index, 'name', e.target.value)}
                    className="flex-1 p-2 border rounded md:text-sm text-black font-medium"
                    placeholder="Player Name"
                 />
             </div>
             <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {roles.map(role => (
                    <button 
                        key={role}
                        onClick={() => onChange(index, 'role', role)}
                        className={cn(
                            "px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-all",
                            player.role === role 
                                ? "bg-secondary text-white border-secondary shadow-md" 
                                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        )}
                    >
                        {role}
                    </button>
                ))}
             </div>
        </div>
    )
}
