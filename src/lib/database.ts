// import { supabase } from './supabase'; 
// Switched to LocalStorage for performance and offline capability as requested.

// --- Types ---
// Reuse types from AppContext or define simplified ones here for local storage
type LocalMatch = any; 

const LOCAL_STORAGE_KEY = 'homeground_matches';

// --- Utility Functions ---

const getLocalMatches = (): LocalMatch[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

const saveLocalMatches = (matches: LocalMatch[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(matches));
};

export const generateMatchId = (): string => {
  return `match_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateMatchCode = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

// --- CRUD Functions (Local Storage Implementation) ---

export const saveMatch = async (matchData: any) => {
    try {
        const matches = getLocalMatches();
        
        // Create full match object
        const newMatch = {
            ...matchData,
            id: generateMatchId(), // Use string ID as primary ID for local
            dbId: Date.now(),      // Fake numeric ID
            matchId: matchData.matchId || generateMatchId(),
            matchCode: matchData.matchCode || generateMatchCode(),
            created_at: new Date().toISOString(),
            status: matchData.status || 'live',
            history: [],
            team1: matchData.team1,
            team2: matchData.team2,
            currentInnings: 1,
            // Ensure all fields exist to prevent UI errors
            innings1: { runs: 0, wickets: 0, overs: 0 },
            innings2: { runs: 0, wickets: 0, overs: 0 },
        };

        matches.push(newMatch);
        saveLocalMatches(matches);
        
        console.log("Match locally saved:", newMatch.id);
        
        // Return in the format the app expects (CamelCase is already used in local obj usually, 
        // but let's ensure consistency if we were mapping before)
        // Since we are now saving exactly what we use, no mapping needed!
        return normalizeMatch(newMatch);

    } catch (error) {
        console.error('Error saving match locally:', error);
        return null;
    }
};

export const updateMatch = async (id: string | number, updates: any) => {
    try {
        const matches = getLocalMatches();
        const index = matches.findIndex((m: any) => m.id === id || m.dbId === id);

        if (index !== -1) {
            // Merge updates
            matches[index] = { ...matches[index], ...updates };
            
            // Auto-update timestamps
            if (updates.status === 'Completed' && !matches[index].completed_at) {
                matches[index].completed_at = new Date().toISOString();
            }

            saveLocalMatches(matches);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating match locally:', error);
        return false;
    }
};

export const deleteMatch = async (id: string | number) => {
    try {
        let matches = getLocalMatches();
        matches = matches.filter((m: any) => m.id !== id && m.dbId !== id);
        saveLocalMatches(matches);
        return true;
    } catch (error) {
        console.error('Error deleting match locally:', error);
        return false;
    }
};

export const getMatchById = async (id: string | number) => {
    const matches = getLocalMatches();
    const match = matches.find((m: any) => m.id === id || m.dbId === id);
    return match ? normalizeMatch(match) : null;
};

export const getMatchByStringId = async (matchId: string) => {
    const matches = getLocalMatches();
    const match = matches.find((m: any) => m.matchId === matchId);
    return match ? normalizeMatch(match) : null;
};

export const getMatchByCode = async (code: string) => {
    const matches = getLocalMatches();
    const match = matches.find((m: any) => m.matchCode === code || m.code === code);
    return match ? normalizeMatch(match) : null;
};

export const getLiveMatches = async () => {
    const matches = getLocalMatches();
    // Filter for live matches
    return matches
        .filter((m: any) => m.status && m.status.toLowerCase() === 'live')
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .map(normalizeMatch);
};

export const getCompletedMatches = async () => {
    const matches = getLocalMatches();
    return matches
        .filter((m: any) => m.status && m.status.toLowerCase() === 'completed')
        .sort((a: any, b: any) => (new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime()))
        .map(normalizeMatch);
};

export const searchMatches = async (queryStr: string) => {
    const matches = getLocalMatches();
    const lowerQuery = queryStr.toLowerCase();
    return matches
        .filter((m: any) => 
            (m.matchCode && m.matchCode.includes(queryStr)) || 
            (m.team1?.name && m.team1.name.toLowerCase().includes(lowerQuery)) ||
            (m.team2?.name && m.team2.name.toLowerCase().includes(lowerQuery))
        )
        .map(normalizeMatch);
};

export const cleanExpiredMatches = async () => {
    // Local storage cleanup if needed, maybe not necessary for personal use
    return 0;
};

// --- Helper to ensure shape consistency ---
const normalizeMatch = (m: any) => {
    // Ensure all fields expected by the UI are present
    return {
        id: m.id?.toString() || m.matchId,
        dbId: m.dbId,
        matchId: m.matchId,
        code: m.matchCode || m.code,
        type: m.match_type || m.type,
        status: (m.status.charAt(0).toUpperCase() + m.status.slice(1)),
        team1: m.team1,
        team2: m.team2,
        tossWinnerId: m.tossWinnerId || m.toss?.winnerId,
        batFirstId: m.batFirstId || m.toss?.batFirstId,
        strikerId: m.strikerId || m.striker,
        nonStrikerId: m.nonStrikerId || m.non_striker,
        currentBowlerId: m.currentBowlerId || m.current_bowler,
        currentInnings: m.currentInnings || m.current_innings || 1,
        currentOver: m.currentOver || m.current_over || 0,
        currentBall: m.currentBall || m.current_ball || 0,
        innings1: m.innings1,
        innings2: m.innings2,
        history: m.history || [],
        createdAt: m.created_at,
        startedAt: m.started_at,
        completedAt: m.completed_at,
        expiresAt: m.expires_at,
        teamSize: m.teamSize || m.team_size,
        oversPerInnings: m.oversPerInnings || m.overs_per_innings,
        timer: m.timer // preserve timer if it exists
    };
};

