import { HandRecord, TeamId } from './types';

export const TARGET_SCORE = 62;
export const MIN_BID = 6;
export const MAX_BID = 14;
export const TOTAL_POINTS = 14;

export interface HandInput {
  biddingTeam: TeamId;
  bidAmount: number;
  dealerFourteenOverFourteen: boolean;
  pointsA: number;
  pointsB: number;
  currentTotalA: number;
  currentTotalB: number;
  handNumber: number;
}

export interface HandOutcome {
  record: HandRecord;
  winner?: TeamId;
}

export function computeHandResult(input: HandInput): HandOutcome {
  const { pointsA, pointsB } = input;
  const biddingPoints = input.biddingTeam === 'A' ? pointsA : pointsB;
  const otherPoints = input.biddingTeam === 'A' ? pointsB : pointsA;
  const madeBid = biddingPoints >= input.bidAmount;

  let biddingDelta: number;
  if (madeBid) {
    biddingDelta = biddingPoints;
  } else if (input.bidAmount === MAX_BID && input.dealerFourteenOverFourteen) {
    biddingDelta = -28;
  } else {
    biddingDelta = -input.bidAmount;
  }
  const otherDelta = otherPoints;

  const scoreDeltaA = input.biddingTeam === 'A' ? biddingDelta : otherDelta;
  const scoreDeltaB = input.biddingTeam === 'B' ? biddingDelta : otherDelta;

  // Apply the bidding team's result first: if it clinches the win, the
  // hand ends there (matches how the win is actually decided at the table).
  let totalA = input.currentTotalA;
  let totalB = input.currentTotalB;
  let winner: TeamId | undefined;

  if (input.biddingTeam === 'A') {
    totalA += scoreDeltaA;
    if (totalA >= TARGET_SCORE) winner = 'A';
  } else {
    totalB += scoreDeltaB;
    if (totalB >= TARGET_SCORE) winner = 'B';
  }

  if (input.biddingTeam === 'A') {
    totalB += scoreDeltaB;
  } else {
    totalA += scoreDeltaA;
  }
  if (!winner) {
    if (totalA >= TARGET_SCORE) winner = 'A';
    else if (totalB >= TARGET_SCORE) winner = 'B';
  }

  const record: HandRecord = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    handNumber: input.handNumber,
    biddingTeam: input.biddingTeam,
    bidAmount: input.bidAmount,
    dealerFourteenOverFourteen: input.dealerFourteenOverFourteen,
    pointsA,
    pointsB,
    madeBid,
    scoreDeltaA,
    scoreDeltaB,
    runningTotalA: totalA,
    runningTotalB: totalB,
    timestamp: Date.now(),
  };

  return { record, winner };
}

export function recomputeTotalsFromHands(hands: HandRecord[]) {
  if (hands.length === 0) return { totalA: 0, totalB: 0 };
  const last = hands[hands.length - 1];
  return { totalA: last.runningTotalA, totalB: last.runningTotalB };
}
