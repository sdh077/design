export const MATCH_VISIBILITIES = ["hidden", "preview", "open"] as const;

export type MatchVisibility = (typeof MATCH_VISIBILITIES)[number];
