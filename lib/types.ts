export type TeamId = 'A' | 'B';

export const TEAM_LABELS: Record<TeamId, string> = { A: 'Vi', B: 'De' };

export interface HandRecord {
  id: string;
  handNumber: number;
  biddingTeam: TeamId;
  bidAmount: number;
  dealerFourteenOverFourteen: boolean;
  pointsA: number;
  pointsB: number;
  madeBid: boolean;
  scoreDeltaA: number;
  scoreDeltaB: number;
  runningTotalA: number;
  runningTotalB: number;
  timestamp: number;
}

export interface Game {
  id: string;
  createdAt: number;
  finishedAt?: number;
  hands: HandRecord[];
  totalA: number;
  totalB: number;
  winner?: TeamId;
  targetScore: number;
}
