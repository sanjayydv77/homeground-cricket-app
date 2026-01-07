"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

import { 
  getLiveMatches, 
  getCompletedMatches, 
  saveMatch, 
  updateMatch as updateMatchDB 
} from "../lib/database";
import { initCleanup } from "../utils/cleanup";

// --- Types ---

export type PlayerRole = "Batsman" | "Bowler" | "All-rounder" | "Keeper";

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
}

export interface Team {
  id: string;
  name: string;
  players: Player[];
  captainId?: string;
  keeperId?: string;
}

export type MatchType = "Single" | "Series" | "Tournament";
export type MatchStatus = "Live" | "Completed" | "Scheduled";

export interface PlayerStats {
  playerId: string;
  matchesPlayed: number;
  runs: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  wickets: number;
  oversBowled: number; // stored as balls ideally, but float is okay if consistent
  runsConceded: number;
}

export interface Series {
  id: string;
  code: string;
  name: string;
  totalMatches: number;
  oversPerInnings: number;
  teamSize: number;
  team1: Team;
  team2: Team;
  matchIds: string[];
  scoreTeam1: number;
  scoreTeam2: number;
  draws: number;
  status: "Scheduled" | "Ongoing" | "Completed";
  cumulativeStats: Record<string, PlayerStats>; // Map playerId to stats
}

export interface Ball {
  id: string;
  inning: 1 | 2;
  over: number;
  ballInOver: number; // 1-6 (or more for extras)
  bowlerId: string;
  batsmanId: string;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket: boolean;
  dismissalType?: "Bowled" | "Caught" | "LBW" | "Run Out" | "Stumped" | "Hit Wicket" | "Retired Hurt" | "Obstructing the Field" | "Hit the Ball Twice" | "Timed Out";
  dismissalText?: string;
  dismissedPlayerId?: string;
  fielderId?: string;
  extras: number;
  timestamp: number;
  isFreeHit?: boolean;
}

export interface TournamentTeamStats {
  played: number;
  won: number;
  lost: number;
  tied: number;
  nr: number;
  points: number;
  nrr: number;
  runsScored: number;
  oversFaced: number;
  runsConceded: number;
  oversBowled: number;
}

export interface TournamentTeam extends Team {
  stats: TournamentTeamStats;
}

export interface Tournament {
  id: string;
  code: string;
  name: string;
  teamSize: number;
  oversPerInnings: number;
  teams: TournamentTeam[];
  matchIds: string[];
  status: "Setup" | "League" | "Knockout" | "Completed";
  knockoutMatches: {
    semiFinal1?: string;
    semiFinal2?: string;
    final?: string;
  };
  winnerId?: string;
}

export interface Match {
  id: string; // The numeric DB ID (converted to string for app consistency)
  dbId?: number; // Actual numeric ID if needed
  matchId?: string; // The "match_timestamp..." ID
  
  code: string; // 4-digit code (App uses this)
  type: MatchType;
  status: MatchStatus;
  seriesId?: string;
  tournamentId?: string;
  team1: Team;
  team2: Team;
  oversPerInnings: number;
  teamSize?: number; // Added teamSize property
  date: Date | any; // Allow flexibility for Firestore Timestamps
  
  // Game State
  tossWinnerId?: string;
  batFirstId?: string;
  currentInnings: 1 | 2;
  
  strikerId?: string;
  nonStrikerId?: string;
  currentBowlerId?: string;

  // These will be populated as game progresses
  history: Ball[]; 
  
  // Specific
  createdAt?: any;
  completedAt?: any;
  expiresAt?: any;
  result?: string;
  winner?: string;
}

interface AppContextType {
  matches: Match[];
  isLoading: boolean;
  addMatch: (match: Match) => Promise<string | null>;
  updateMatch: (matchId: string, updates: Partial<Match>) => void;
  getMatchByCode: (code: string) => Match | undefined;
  
  // Series
  seriesList: Series[];
  addSeries: (series: Series) => void;
  updateSeries: (seriesId: string, updates: Partial<Series>) => void;
  getSeriesById: (id: string) => Series | undefined;

  // Tournament
  tournaments: Tournament[];
  addTournament: (tournament: Tournament) => void;
  updateTournament: (id: string, updates: Partial<Tournament>) => void;
  getTournamentById: (id: string) => Tournament | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  // Initialize Data and Cleanup
  React.useEffect(() => {
    const loadData = async () => {
      try {
        const [live, completed] = await Promise.all([
          getLiveMatches(),
          getCompletedMatches()
        ]);
        
        // Convert Timestamps/Strings to Dates if needed
        const processMatch = (m: any) : Match => ({
             ...m,
             // Ensure IDs are strings for React keys and URL usage
             id: m.id ? m.id.toString() : (m.matchId || "temp"),
             date: m.date ? new Date(m.date) : new Date(),
             createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
             completedAt: m.completedAt ? new Date(m.completedAt) : null,
             expiresAt: m.expiresAt ? new Date(m.expiresAt) : null
        });

        setMatches([...live.map(processMatch), ...completed.map(processMatch)]);
      } catch(e) {
        console.error("Failed to load matches", e);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    // No interval here as per strict request, but usually good practice.
    // Use interval if requested. User requested "Refresh every 30 seconds" in Phase 5 example.
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const addMatch = async (match: Match) => {
    // Save to Database first to get the ID
    const saved = await saveMatch(match);
    
    if (saved) {
        // Update local state with the returned DB match
        // Ensure serialization consistency
        const newMatch = { ...match, ...saved, id: saved.id.toString() }; 
        setMatches((prev) => [newMatch, ...prev]);
        return saved.id.toString();
    } else {
        // Fallback or Error handling
        console.error("Failed to save match to Supabase");
        return null;
    }
  };

  const updateMatch = async (matchId: string, updates: Partial<Match>) => {
      // Find the match to get its DB ID
      const matchIndex = matches.findIndex(m => m.id === matchId);
      if (matchIndex === -1) return;
      
      const existingMatch = matches[matchIndex];
      const dbId = existingMatch.dbId || parseInt(matchId); // Use dbId if present, else try parsing string ID

      if (!dbId) {
          console.error("Cannot update match without valid DB ID");
          return;
      }

      // Prepare updates
      const dbUpdates: any = { ...updates };
      if (updates.status) dbUpdates.status = updates.status.toLowerCase();
      
      // Auto-add expiry if completing
      if (updates.status === 'Completed' && !updates.expiresAt) {
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          dbUpdates.completedAt = now.toISOString();
          dbUpdates.expiresAt = expiresAt.toISOString();
          
          updates.completedAt = now; // Local update
          updates.expiresAt = expiresAt; // Local update
      }

      // Optimistic Update
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m));

      // Save to Supabase
      await updateMatchDB(dbId, dbUpdates);
  };

  const getMatchByCode = (code: string) => {
    return matches.find((m) => m.code === code);
  };

  // Series Methods
  const addSeries = (series: Series) => {
    setSeriesList((prev) => [series, ...prev]);
  };

  const updateSeries = (seriesId: string, updates: Partial<Series>) => {
    setSeriesList(prev => prev.map(s => s.id === seriesId ? { ...s, ...updates } : s));
  };

  const getSeriesById = (id: string) => {
    return seriesList.find(s => s.id === id);
  };

  // Tournament Methods
  const addTournament = (tournament: Tournament) => {
      setTournaments(prev => [tournament, ...prev]);
  }

  const updateTournament = (id: string, updates: Partial<Tournament>) => {
      setTournaments(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }

  const getTournamentById = (id: string) => {
      return tournaments.find(t => t.id === id);
  }

  return (
    <AppContext.Provider value={{ 
      matches, isLoading, addMatch, updateMatch, getMatchByCode,
      seriesList, addSeries, updateSeries, getSeriesById,
      tournaments, addTournament, updateTournament, getTournamentById
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
