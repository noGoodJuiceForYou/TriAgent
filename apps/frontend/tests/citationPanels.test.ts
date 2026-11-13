import { describe, expect, it } from "vitest";

import {
  activeCitationPanel,
  closeCitationPanel,
  dedupeReferences,
  pruneCitationPanels,
  selectCitedChunk,
  toggleCitationPanel,
  type CitationStateBySession
} from "../src/chat/citationPanels";
import type { ChatReference } from "../src/chat/referenceLink";

const first: ChatReference = {
  id: "reference_1",
  title: "Restart runbook",
  sourceType: "document",
  documentId: "doc_1",
  knowledgeBaseId: "kb_1"
};
const second: ChatReference = {
  id: "reference_2",
  title: "Pool exhaustion runbook",
  sourceType: "document",
  documentId: "doc_2",
  knowledgeBaseId: "kb_1"
};

describe("reference deduplication", () => {
  it("collapses the same chunk returned by several retrieval calls", () => {
    const deduped = dedupeReferences([first, second, first, { ...second }]);

    expect(deduped.map((item) => item.id)).toEqual(["reference_1", "reference_2"]);
  });

  it("keeps the best-scored chunk first and caps the list", () => {
    const scored = [
      { ...first, rerankScore: 0.42 },
      { ...second, rerankScore: 0.91 },
      { id: "reference_3", title: "Other", sourceType: "document" as const, score: 0.6 }
    ];

    const deduped = dedupeReferences(scored, 2);

    expect(deduped.map((item) => item.id)).toEqual(["reference_2", "reference_3"]);
  });

  it("dedupes references when a conversation panel opens", () => {
    const opened = toggleCitationPanel({}, "chat_a", "message_1", [first, first, second]);

    expect(activeCitationPanel(opened, "chat_a")?.references.map((item) => item.id)).toEqual([
      "reference_1",
      "reference_2"
    ]);
  });
});

describe("per-conversation citation panel state", () => {
  it("opens on the first chunk and collapses when the same answer is toggled again", () => {
    const opened = toggleCitationPanel({}, "chat_a", "message_1", [first, second]);

    expect(activeCitationPanel(opened, "chat_a")).toEqual({
      messageId: "message_1",
      references: [first, second],
      selectedReferenceId: "reference_1"
    });

    const collapsed = toggleCitationPanel(opened, "chat_a", "message_1", [first, second]);
    expect(activeCitationPanel(collapsed, "chat_a")).toBeNull();
  });

  it("switches content when another answer in the same conversation is toggled", () => {
    const opened = toggleCitationPanel({}, "chat_a", "message_1", [first]);
    const switched = toggleCitationPanel(opened, "chat_a", "message_2", [second]);

    expect(activeCitationPanel(switched, "chat_a")).toEqual({
      messageId: "message_2",
      references: [second],
      selectedReferenceId: "reference_2"
    });
  });

  it("keeps each conversation independent when switching between them", () => {
    const withA = toggleCitationPanel({}, "chat_a", "message_1", [first]);
    const withBoth = toggleCitationPanel(withA, "chat_b", "message_9", [second]);

    expect(activeCitationPanel(withBoth, "chat_a")?.messageId).toBe("message_1");
    expect(activeCitationPanel(withBoth, "chat_b")?.messageId).toBe("message_9");

    const collapsedB = toggleCitationPanel(withBoth, "chat_b", "message_9", [second]);
    expect(activeCitationPanel(collapsedB, "chat_a")?.messageId).toBe("message_1");
    expect(activeCitationPanel(collapsedB, "chat_b")).toBeNull();
  });

  it("reports no panel for a conversation that never opened one", () => {
    const state = toggleCitationPanel({}, "chat_a", "message_1", [first]);

    expect(activeCitationPanel(state, "chat_c")).toBeNull();
    expect(activeCitationPanel(state, null)).toBeNull();
  });

  it("ignores toggles without an active conversation or without references", () => {
    expect(toggleCitationPanel({}, null, "message_1", [first])).toEqual({});
    expect(toggleCitationPanel({}, "chat_a", "message_1", [])).toEqual({});
  });

  it("tracks the selected chunk without changing the owning message", () => {
    const opened = toggleCitationPanel({}, "chat_a", "message_1", [first, second]);
    const selected = selectCitedChunk(opened, "chat_a", "reference_2");

    expect(activeCitationPanel(selected, "chat_a")).toMatchObject({
      messageId: "message_1",
      selectedReferenceId: "reference_2"
    });
    expect(selectCitedChunk(selected, "chat_a", "reference_2")).toBe(selected);
  });

  it("closes, prunes and tolerates unknown conversations", () => {
    const state: CitationStateBySession = toggleCitationPanel(
      toggleCitationPanel({}, "chat_a", "message_1", [first]),
      "chat_b",
      "message_2",
      [second]
    );

    const pruned = pruneCitationPanels(state, ["chat_b"]);
    expect(Object.keys(pruned)).toEqual(["chat_b"]);
    expect(pruneCitationPanels(state, ["chat_a", "chat_b"])).toBe(state);
    expect(closeCitationPanel(state, "chat_missing")).toBe(state);
    expect(closeCitationPanel(pruned, "chat_b")).toEqual({});
  });
});
