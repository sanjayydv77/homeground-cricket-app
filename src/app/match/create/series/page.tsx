"use client";

import React, { useState } from "react";
import { Layout } from "@/components/ui/Layout";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Trophy, Users, AlertCircle } from "lucide-react";
import { useApp, Team, Player, PlayerRole, Series } from "@/contexts/AppContext";
import { cn } from "@/lib/utils";

export default function CreateSeries() {
    const router = useRouter();
    const { addSeries } = useApp();

    const [step, setStep] = useState(1);
    
    // Series Config State
    const [seriesName, setSeriesName] = useState("");
    const [numMatches, setNumMatches] = useState<number | "">("");
    const [overs, setOvers] = useState<number | "">("");
    const [teamSize, setTeamSize] = useState<number | "">("");
    
    const [team1Name, setTeam1Name] = useState("");
    const [team2Name, setTeam2Name] = useState("");

    const [team1Players, setTeam1Players] = useState<Player[]>([]);
    const [team2Players, setTeam2Players] = useState<Player[]>([]);

    const initializePlayers = (size: number) => {
        return Array.from({ length: size }).map((_, i) => ({
            id: Math.random().toString(36).substring(7),
            name: "",
            role: "All-rounder" as PlayerRole,
        }));
    };

    const handleNextStep1 = () => {
        // Validation
        if (!seriesName.trim()) { alert("Please enter a series name"); return; }
        if (!numMatches || !overs || !teamSize) { alert("Please complete all fields"); return; }
        if (!team1Name.trim() || !team2Name.trim()) { alert("Please enter Team names"); return; }
        
        if (numMatches < 2 || numMatches > 10) { alert("Matches must be between 2 and 10"); return; }
        if (teamSize < 7 || teamSize > 15) { alert("Team Size must be between 7 and 15"); return; }
        
        setTeam1Players(initializePlayers(teamSize));
        setTeam2Players(initializePlayers(teamSize));
        setStep(2);
    };

    const validateTeam = (players: Player[], name: string) => {
        const keepers = players.filter(p => p.role === "Keeper").length;
        if (keepers !== 1) return `${name} must have exactly 1 Keeper (current: ${keepers})`;
        if (players.some(p => !p.name.trim())) return `All players in ${name} must have names`;
        return null;
    };

    const handleCreateSeries = () => {
        const t1Error = validateTeam(team1Players, team1Name);
        if (t1Error) { alert(t1Error); return; }
        
        const t2Error = validateTeam(team2Players, team2Name);
        if (t2Error) { alert(t2Error); return; }

        const seriesId = Math.random().toString(36).substring(7);
        const seriesCode = Math.floor(1000 + Math.random() * 9000).toString();

        const t1: Team = {
            id: Math.random().toString(36).substring(7),
            name: team1Name,
            players: team1Players,
            keeperId: team1Players.find(p => p.role === 'Keeper')?.id
        };

        const t2: Team = {
            id: Math.random().toString(36).substring(7),
            name: team2Name,
            players: team2Players,
            keeperId: team2Players.find(p => p.role === 'Keeper')?.id
        };

        const newSeries: Series = {
            id: seriesId,
            code: seriesCode,
            name: seriesName,
            totalMatches: Number(numMatches),
            oversPerInnings: Number(overs),
            teamSize: Number(teamSize),
            team1: t1,
            team2: t2,
            matchIds: [],
            scoreTeam1: 0,
            scoreTeam2: 0,
            draws: 0,
            status: "Scheduled",
            cumulativeStats: {}
        };

        addSeries(newSeries);
        router.push(`/series/${seriesId}`);
    };

    return (
        <Layout>
            <header className="p-4 bg-white shadow-sm flex items-center gap-4 sticky top-0 z-10">
                <button onClick={() => step > 1 ? setStep(step - 1) : router.back()} className="text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-xl font-bold text-secondary">
                        {step === 1 ? "New Series Setup" : step === 2 ? `${team1Name} Squad` : `${team2Name} Squad`}
                    </h1>
                     <div className="flex gap-1 mt-1">
                        <div className={`h-1 w-8 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-8 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`} />
                        <div className={`h-1 w-8 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`} />
                    </div>
                </div>
            </header>

            <main className="p-4 pb-20 max-w-2xl mx-auto">
                {step === 1 && (
                    <div className="space-y-6 bg-white p-6 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex items-center gap-3 text-primary mb-2">
                            <Trophy className="w-6 h-6" />
                            <h2 className="font-bold text-lg">Series Details</h2>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Series Name <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                value={seriesName} 
                                onChange={e => setSeriesName(e.target.value)} 
                                className="w-full p-3 border rounded-xl text-black focus:ring-2 focus:ring-primary focus:border-primary outline-none" 
                                placeholder="e.g. Ashes 2026"
                                autoFocus
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Matches</label>
                                <input 
                                    type="number" min="2" max="10" 
                                    value={numMatches} 
                                    onChange={e => setNumMatches(e.target.value === "" ? "" : parseInt(e.target.value))} 
                                    className="w-full p-3 border rounded-xl text-black" 
                                    placeholder="e.g. 5"
                                />
                                <p className="text-xs text-gray-500 mt-1">Min 2, Max 10</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Overs / Innings</label>
                                <input 
                                    type="number" min="1" 
                                    value={overs} 
                                    onChange={e => setOvers(e.target.value === "" ? "" : parseInt(e.target.value))} 
                                    className="w-full p-3 border rounded-xl text-black" 
                                    placeholder="e.g. 20"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Players per Team</label>
                            <input 
                                type="number" min="7" max="15" 
                                value={teamSize} 
                                onChange={e => setTeamSize(e.target.value === "" ? "" : parseInt(e.target.value))} 
                                className="w-full p-3 border rounded-xl text-black" 
                                placeholder="e.g. 11"
                            />
                             <p className="text-xs text-gray-500 mt-1">Min 7, Max 15</p>
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="font-bold text-secondary mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4" /> Teams
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Team 1 Name</label>
                                    <input 
                                        type="text" 
                                        value={team1Name} 
                                        onChange={e => setTeam1Name(e.target.value)} 
                                        className="w-full p-2 border rounded-lg text-black" 
                                        placeholder="e.g. England"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Team 2 Name</label>
                                    <input 
                                        type="text" 
                                        value={team2Name} 
                                        onChange={e => setTeam2Name(e.target.value)} 
                                        className="w-full p-2 border rounded-lg text-black" 
                                        placeholder="e.g. Australia"
                                    />
                                </div>
                            </div>
                        </div>

                        <button onClick={handleNextStep1} className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg mt-4 hover:bg-primary/90 transition-colors">
                            Next: Setup Logic
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
                        onNext={handleCreateSeries}
                        isLastStep
                    />
                )}
            </main>
        </Layout>
    );
}

function TeamSetup({ teamName, players, setPlayers, onNext, isLastStep }: { 
    teamName: string, 
    players: Player[], 
    setPlayers: React.Dispatch<React.SetStateAction<Player[]>>, 
    onNext: () => void,
    isLastStep?: boolean
}) {
    
    const updatePlayer = (index: number, field: keyof Player, value: string | PlayerRole) => {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], [field]: value };
        setPlayers(newPlayers);
    };

    const roles: PlayerRole[] = ["Batsman", "Bowler", "All-rounder", "Keeper"];
    const keeperCount = players.filter(p => p.role === 'Keeper').length;

    return (
        <div className="space-y-4 animate-in slide-in-from-right-8 fade-in">
             <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <p>Setting up <strong>{teamName}</strong>. Assign exactly <strong>ONE Keeper</strong>.</p>
            </div>

            <div className="space-y-3">
                {players.map((player, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border flex flex-col gap-2">
                         <div className="flex items-center gap-2">
                             <span className="text-xs font-mono text-gray-400 w-6">#{idx + 1}</span>
                             <input 
                                type="text" 
                                value={player.name} 
                                onChange={(e) => updatePlayer(idx, 'name', e.target.value)}
                                className="flex-1 p-2 border rounded md:text-sm text-black font-medium"
                                placeholder="Player Name"
                             />
                         </div>
                         <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {roles.map(role => (
                                <button 
                                    key={role}
                                    onClick={() => updatePlayer(idx, 'role', role)}
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
                ))}
            </div>
            
            <div className="sticky bottom-4 pt-4 bg-gradient-to-t from-slate-100 to-transparent">
                 {keeperCount !== 1 && (
                    <div className="mb-2 text-center text-red-500 text-xs font-bold bg-white/80 py-1 rounded">
                        ⚠ Team needs exactly 1 Keeper (Current: {keeperCount})
                    </div>
                )}
                <button onClick={onNext} className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                    {isLastStep ? "Create Series" : "Next Team"} <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
