import type { ReferenceSourceSseEvent } from "@triagent-ops/api-contracts";

export type ChatReference = ReferenceSourceSseEvent["reference"];

export interface ReferenceDocumentQuery {
  readonly documentId: string;
  readonly knowledgeBaseId: string;
}

/** Resolve the knowledge route query for a citation that points at an indexed document. */
export function referenceDocumentQuery(
  reference: ChatReference
): ReferenceDocumentQuery | null {
  const { documentId, knowledgeBaseId } = reference;
  if (typeof documentId !== "string" || typeof knowledgeBaseId !== "string") return null;
  if (documentId.length === 0 || knowledgeBaseId.length === 0) return null;
  return { documentId, knowledgeBaseId };
}

export type TabOpener = (url: string, target: string, features: string) => unknown;

/**
 * Open the resolved source document in a separate browser tab.
 * Returns false when the browser blocks the window so callers can fall back.
 */
export function openReferenceInNewTab(href: string, opener?: TabOpener): boolean {
  const open: TabOpener =
    opener ??
    ((url, target, features) =>
      typeof window === "undefined" ? null : window.open(url, target, features));
  const handle = open(href, "_blank", "noopener,noreferrer");
  return handle !== null && handle !== undefined;
}
