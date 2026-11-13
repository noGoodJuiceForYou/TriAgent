import type { ChatReference } from "./referenceLink";

/** References below this score sort last; missing scores are not treated as zero. */
function referenceScore(reference: ChatReference): number {
  return reference.rerankScore ?? reference.score ?? Number.NEGATIVE_INFINITY;
}

/**
 * Collapse citations that point at the same chunk and keep the best-scored few.
 * The same chunk can be returned by several retrieval calls inside one answer.
 */
export function dedupeReferences(
  items: readonly ChatReference[],
  limit = 5
): readonly ChatReference[] {
  const seen = new Set<string>();
  const unique: ChatReference[] = [];
  for (const item of items) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    unique.push(item);
  }
  return unique.sort((left, right) => referenceScore(right) - referenceScore(left)).slice(0, limit);
}

export interface SessionCitationState {
  readonly messageId: string;
  readonly references: readonly ChatReference[];
  readonly selectedReferenceId: string;
}

export type CitationStateBySession = Readonly<Record<string, SessionCitationState>>;

/** Read the citation panel state that belongs to one conversation. */
export function activeCitationPanel(
  state: CitationStateBySession,
  sessionId: string | null
): SessionCitationState | null {
  if (sessionId === null) return null;
  return state[sessionId] ?? null;
}

/**
 * Toggle the panel for one conversation: the same answer collapses it,
 * another answer in the same conversation switches to its references.
 */
export function toggleCitationPanel(
  state: CitationStateBySession,
  sessionId: string | null,
  messageId: string,
  references: readonly ChatReference[]
): CitationStateBySession {
  if (sessionId === null) return state;
  const current = state[sessionId];
  if (current !== undefined && current.messageId === messageId) {
    return closeCitationPanel(state, sessionId);
  }
  const deduped = dedupeReferences(references);
  const first = deduped[0];
  if (first === undefined) return state;
  return {
    ...state,
    [sessionId]: { messageId, references: deduped, selectedReferenceId: first.id }
  };
}

export function selectCitedChunk(
  state: CitationStateBySession,
  sessionId: string | null,
  referenceId: string
): CitationStateBySession {
  if (sessionId === null) return state;
  const current = state[sessionId];
  if (current === undefined || current.selectedReferenceId === referenceId) return state;
  return { ...state, [sessionId]: { ...current, selectedReferenceId: referenceId } };
}

export function closeCitationPanel(
  state: CitationStateBySession,
  sessionId: string | null
): CitationStateBySession {
  if (sessionId === null || state[sessionId] === undefined) return state;
  const next = { ...state };
  delete next[sessionId];
  return next;
}

/** Drop panel state for conversations that no longer exist. */
export function pruneCitationPanels(
  state: CitationStateBySession,
  sessionIds: readonly string[]
): CitationStateBySession {
  const known = new Set(sessionIds);
  const retained = Object.entries(state).filter(([sessionId]) => known.has(sessionId));
  if (retained.length === Object.keys(state).length) return state;
  return Object.fromEntries(retained);
}
