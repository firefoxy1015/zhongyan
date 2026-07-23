import type { LiarGamePhase } from "./liar-game";

export const ROOM_PHASES: LiarGamePhase[] = [
  "lobby",
  "rules",
  "identity",
  "stories",
  "deduction",
  "vote",
  "result",
];

export const ROOM_CAPACITY = 9;
const CANONICAL_LIAR_TARGET = "renyang";
const VALID_VOTE_TARGETS = new Set([
  "renyang",
  "tiantian",
  "qiao",
  "xiao",
  "zhao",
  "han",
  "zhang",
  "li",
  "lin",
  "qixia",
]);

export function nextRoomPhase(phase: string): LiarGamePhase | null {
  const currentIndex = ROOM_PHASES.indexOf(phase as LiarGamePhase);
  if (currentIndex < 0 || currentIndex >= ROOM_PHASES.length - 1) return null;
  return ROOM_PHASES[currentIndex + 1];
}

export function isVoteTarget(targetId: string): boolean {
  return VALID_VOTE_TARGETS.has(targetId);
}

export function resolveRoomVotes(targets: string[]) {
  const allCorrect = targets.length === ROOM_CAPACITY && targets.every((target) => target === CANONICAL_LIAR_TARGET);
  return {
    allCorrect,
    outcome: allCorrect ? "participants-survive" : "liar-survives",
  } as const;
}
