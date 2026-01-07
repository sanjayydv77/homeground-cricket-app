"use client";

import React, { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useApp, Match, Team, Player, PlayerRole } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export default function CreateSingleMatch() {
  const router = useRouter();
  const { addMatch } = useApp();

  const [step, setStep] = useState(1);
  const [overs, setOvers] = useState<number | "">("");
  const [teamSize, setTeamSize] = useState<number | "">("");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  
  // Players state is a bit complex. Array of basic objects first.
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [isCreating, setIsCreating] = useState(false); // Add Loading State

  // Initialize players when teamSize changes (if valid)
  const initializePlayers = (size: number) => {
    return Array.from({ length: size }).map((_, i) => ({
      id: Math.random().toString(36).substring(7),
      name: "",
      role: "All-rounder" as PlayerRole,
    }));
  };

  const handleNextStep1 = () => {
    if (!overs || !teamSize) { alert("Please fill all fields"); return; }
    if (overs <= 0 || teamSize <= 0) return;
    if (!team1Name.trim() || !team2Name.trim()) { alert("Please enter Team names"); return; }
    
    setTeam1Players(initializePlayers(teamSize));
    setTeam2Players(initializePlayers(teamSize));
    setStep(2);
  };

  const validateTeam = (players: Player[]) => {
      const keepers = players.filter(p => p.role === "Keeper").length;
      if (keepers !== 1) return `Team must have exactly 1 Keeper (current: ${keepers})`;
      if (players.some(p => !p.name.trim())) return "All players must have names";
      return null;
  }

  const handleCreateMatch = async () => {
      if (isCreating) return; // Prevent double click
      setIsCreating(true);

      const t1Error = validateTeam(team1Players);
      if (t1Error) { alert(t1Error + " in " + team1Name); setIsCreating(false); return; }
      
      const t2Error = validateTeam(team2Players);
      if (t2Error) { alert(t2Error + " in " + team2Name); setIsCreating(false); return; }

      try {
        const t1: Team = {
            id: Math.random().toString(),
            name: team1Name,
            players: team1Players,
            keeperId: team1Players.find(p => p.role === 'Keeper')?.id
        };

        const t2: Team = {
            id: Math.random().toString(),
            name: team2Name,
            players: team2Players,
            keeperId: team2Players.find(p => p.role === 'Keeper')?.id
        };

        const matchId = Math.random().toString(36).substring(7);
        const matchCode = Math.floor(1000 + Math.random() * 9000).toString();

        const newMatch: Match = {
            id: matchId, // This is temporary, will be overwritten by DB ID
            code: matchCode,
            type: "Single",
            status: "Live", // Actually it goes to toss first, but "Live" covers ongoing process
            team1: t1,
            team2: t2,
            oversPerInnings: Number(overs),
            teamSize: Number(teamSize),
            date: new Date(),
            currentInnings: 1,
            history: []
        };

        const savedId = await addMatch(newMatch);
        if (savedId) {
            router.push(`/match/${savedId}`);
        } else {
            alert("Error creating match. Please check console/network.");
            setIsCreating(false);
        }
      } catch (error) {
        console.error("Match creation failed", error);
        alert("An error occurred while creating the match.");
        setIsCreating(false);
      }
  };

  return (
    <Layout>
      <header className="p-4 bg-white shadow-sm flex items-center gap-4">
        <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-secondary">
            {step === 1 ? "Match Settings" : step === 2 ? "Team 1 Setup" : "Team 2 Setup"}
        </h1>
      </header>

      <main className="p-4 pb-20">
        {step === 1 && (
            <div className="space-y-6 max-w-lg mx-auto bg-white p-6 rounded-xl shadow-sm">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Overs per Innings</label>
                    <input type="number" min="1" value={overs} onChange={e => setOvers(e.target.value === "" ? "" : parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-black" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Players per Team</label>
                    <input type="number" min="2" value={teamSize} onChange={e => setTeamSize(e.target.value === "" ? "" : parseInt(e.target.value))} className="w-full p-2 border rounded-lg text-black" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 1 Name</label>
                    <input type="text" value={team1Name} onChange={e => setTeam1Name(e.target.value)} className="w-full p-2 border rounded-lg text-black" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Team 2 Name</label>
                    <input type="text" value={team2Name} onChange={e => setTeam2Name(e.target.value)} className="w-full p-2 border rounded-lg text-black" />
                </div>
                
                <button onClick={handleNextStep1} className="w-full bg-primary text-white py-3 rounded-xl font-bold mt-4">
                    Next: Setup Teams
                </button>
            </div>
        )}

        {step === 2 && (
            <TeamSetup 
                teamName={team1Name} 
                players={team1Players} 
                setPlayers={setTeam1Players}
                onNext={() => setStep(3)}
            />
        )}

        {step === 3 && (
            <TeamSetup 
                teamName={team2Name} 
                players={team2Players} 
                setPlayers={setTeam2Players}
                onNext={handleCreateMatch}
                isLastStep
                isLoading={isCreating}
            />
        )}
      </main>
    </Layout>
  );
}

function TeamSetup({ teamName, players, setPlayers, onNext, isLastStep, isLoading }: { 
    teamName: string, 
    players: Player[], 
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>, 
    onNext: () => void,
    isLastStep?: boolean,
    isLoading?: boolean
}) {
    
    const updatePlayer = (index: number, field: keyof Player, value: string | PlayerRole) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], [field]: value };
        setPlayers(newPlayers);
    };

    const roles: PlayerRole[] = ["Batsman", "Bowler", "All-rounder", "Keeper"];

    return (
        <div className="space-y-4">
            <h2 className="font-bold text-lg text-secondary px-1">Adding Players for {teamName}</h2>
            <div className="space-y-3">
                {players.map((player, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                             <span className="text-xs font-mono text-gray-400 w-6">#{idx + 1}</span>
                             <input 
                                type="text" 
                                value={player.name} 
                                onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                                className="flex-1 p-2 border rounded md:text-sm text-black"
                                placeholder="Player Name"
                             />
                         </div>
                         <div className="flex gap-2 overflow-x-auto pb-1">
                            {roles.map(role => (
                                <button 
                                    key={role}
                                    onClick={() => updatePlayer(idx, 'role', role)}
                                    className={cn(
                                        "px-3 py-1 rounded-full text-xs whitespace-nowrap border transition-colors",
                                        player.role === role 
                                            ? "bg-primary text-white border-primary" 
                                            : "bg-gray-50 text-gray-600 border-gray-200"
                                    )}
                                >
                                    {role}
                                </button>
                            ))}
                         </div>
                    </div>
                ))}
            </div>
            
            <button 
                onClick={onNext} 
                disabled={isLoading}
                className={cn(
                    "w-full sticky bottom-4 bg-primary text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2",
                    isLoading && "opacity-70 cursor-not-allowed"
                )}
            >
                {isLoading ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                    <>
                         {isLastStep ? "Start Match" : "Next Team"} <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </div>
    )
}
