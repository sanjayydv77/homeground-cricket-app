
import { Match, Ball, Player } from "@/contexts/AppContext";

export interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  out: boolean;
  dismissal?: string;
}

export interface BowlerStats {
  id: string;
  name: string;
  overs: string;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

export interface MatchStats {
    batting1: BatsmanStats[];
    bowling1: BowlerStats[];
    batting2: BatsmanStats[];
    bowling2: BowlerStats[];
    score1: { runs: number; wickets: number; overs: string };
    score2: { runs: number; wickets: number; overs: string };
    extras1: { total: number; wides: number; noBalls: number; byes: number; legByes: number };
    extras2: { total: number; wides: number; noBalls: number; byes: number; legByes: number };
}

export const calculateMatchStats = (match: Match): MatchStats => {
    const processInnings = (innings: number, battingTeamPlayers: Player[], bowlingTeamPlayers: Player[]) => {
        const balls = match.history.filter(b => b.inning === innings);
        
        // Batting Stats
        const battingStats: BatsmanStats[] = battingTeamPlayers.map(p => {
            const playerBalls = balls.filter(b => b.batsmanId === p.id);
            const runs = playerBalls.reduce((sum, b) => sum + b.runs, 0);
            const ballCount = playerBalls.filter(b => !b.isWide).length;
            const fours = playerBalls.filter(b => b.runs === 4).length;
            const sixes = playerBalls.filter(b => b.runs === 6).length;
            
            // Check dismissal
            // A player is out if there is a ball where dismissedPlayerId === p.id
            // Fallback for when dismissedPlayerId might be missing but isWicket is true on their ball
            const wicketBall = balls.find(b => {
                if (b.dismissedPlayerId) return b.dismissedPlayerId === p.id;
                return b.isWicket && b.batsmanId === p.id;
            });
            
            return {
                id: p.id,
                name: p.name,
                runs,
                balls: ballCount,
                fours,
                sixes,
                strikeRate: ballCount > 0 ? (runs / ballCount) * 100 : 0,
                out: !!wicketBall,
                dismissal: wicketBall?.dismissalText
            };
        });

        // Filter out those who didn't bat? Or show DNB?
        // Usually full scorecard shows Did Not Bat.
        // For now, let's keep order as team list
        

        // Bowling Stats
        // Identify all bowlers who actually bowled
        const bowlerIds = Array.from(new Set(balls.map(b => b.bowlerId)));
        
        const bowlingStats: BowlerStats[] = bowlerIds.map(bid => {
            const player = bowlingTeamPlayers.find(p => p.id === bid);
            const bowlerBalls = balls.filter(b => b.bowlerId === bid);
            
            // Allowances for legal balls
            const legalBalls = bowlerBalls.filter(b => !b.isWide && !b.isNoBall);
            const oversCount = Math.floor(legalBalls.length / 6);
            const ballsCount = legalBalls.length % 6;
            
            const runsConceded = bowlerBalls.reduce((sum, b) => sum + b.runs + b.extras, 0);
            const wickets = bowlerBalls.filter(b => b.isWicket && b.dismissalType !== "Run Out").length;
            const dots = bowlerBalls.filter(b => b.runs === 0 && !b.isWide && !b.isNoBall).length;

            // Maidens calculation (simplified: any over with 0 runs)
            // Ideally need to group by Over Number
            let maidens = 0;
            const oversMap = new Map<number, number>();
            bowlerBalls.forEach(b => {
                 if (!b.isWide && !b.isNoBall) {
                     const current = oversMap.get(b.over) || 0;
                     oversMap.set(b.over, current + b.runs + b.extras); // extras usually count against bowler if W/NB
                 }
            });
            
            // This maiden logic is basic, improving it requires accurate per-over aggregation including extras
            // For now, simple economy is key
            
            const totalOvers = oversCount + (ballsCount / 6);
            
            return {
                id: bid,
                name: player?.name || "Unknown",
                overs: `${oversCount}.${ballsCount}`,
                maidens: 0, // TODO: Implement strict calculation
                runs: runsConceded,
                wickets,
                economy: totalOvers > 0 ? runsConceded / totalOvers : 0,
                dots
            };
        }).sort((a, b) => b.wickets - a.wickets); // Highest wickets first

        // Extras
        const wides = balls.filter(b => b.isWide).length; // + runs attached? Usually 1 + runs
        // In this simple model, let's assume b.extras stores total extra runs for that ball
        const totalExtras = balls.reduce((sum, b) => sum + b.extras, 0); 
        
        const totalRuns = balls.reduce((sum, b) => sum + b.runs + b.extras, 0);
        const totalWickets = balls.filter(b => b.isWicket).length;
        const totalLegalBalls = balls.filter(b => !b.isWide && !b.isNoBall).length;
        const overStr = `${Math.floor(totalLegalBalls/6)}.${totalLegalBalls%6}`;

        return {
            batting: battingStats,
            bowling: bowlingStats,
            score: { runs: totalRuns, wickets: totalWickets, overs: overStr },
            extras: { total: totalExtras, wides, noBalls: 0, byes: 0, legByes: 0 } // Simplified
        };
    };

    const team1Batting = match.batFirstId === match.team1.id ? match.team1 : match.team2;
    const team1Bowling = match.batFirstId === match.team1.id ? match.team2 : match.team1;
    
    const team2Batting = match.batFirstId === match.team1.id ? match.team2 : match.team1;
    const team2Bowling = match.batFirstId === match.team1.id ? match.team1 : match.team2;

    const stats1 = processInnings(1, team1Batting.players, team1Bowling.players);
    const stats2 = processInnings(2, team2Batting.players, team2Bowling.players);

    return {
        batting1: stats1.batting,
        bowling1: stats1.bowling,
        score1: stats1.score,
        extras1: stats1.extras,
        batting2: stats2.batting,
        bowling2: stats2.bowling,
        score2: stats2.score,
        extras2: stats2.extras
    };
};

export interface PlayerPerformance {
    playerId: string;
    points: number;
    desc: string;
    name: string; // Added Name
}

export const calculateManOfTheMatch = (match: Match, stats: MatchStats): PlayerPerformance | null => {
    let bestPlayer: PlayerPerformance | null = null;
    let maxPoints = -1;

    const allPlayers = [...match.team1.players, ...match.team2.players];

    allPlayers.forEach(player => {
        let points = 0;
        const batStats = [...stats.batting1, ...stats.batting2].find(p => p.id === player.id);
        const bowlStats = [...stats.bowling1, ...stats.bowling2].find(p => p.id === player.id);

        let descParts = [];

        // Batting Points
        if (batStats) {
            points += batStats.runs * 2;
            points += batStats.fours * 2;
            points += batStats.sixes * 5;
            if (batStats.strikeRate > 120 && batStats.runs > 10) points += 10; // Simple weight
            if (batStats.runs >= 50) points += 30; // Milestone
            
            if (batStats.runs > 0) descParts.push(`${batStats.runs} (${batStats.balls})`); // e.g. 45 (32)
        }

        // Bowling Points
        if (bowlStats) {
            points += bowlStats.wickets * 25;
            points += bowlStats.maidens * 10;
            points += bowlStats.dots * 0.5;
            if (bowlStats.economy < 6 && bowlStats.overs.startsWith("2")) points += 10; // Good economy
            if (bowlStats.wickets >= 3) points += 30;

            if (bowlStats.wickets > 0) descParts.push(`${bowlStats.wickets}/${bowlStats.runs}`); // e.g. 3/24
        }
        
        // Winning Team Bonus?
        // Let's keep it purely stats based for fairness, but traditionally winning team gets preference.

        if (points > maxPoints) {
            maxPoints = points;
            bestPlayer = {
                playerId: player.id,
                name: player.name,
                points,
                desc: descParts.join(" & ")
            };
        }
    });

    return bestPlayer;
};
