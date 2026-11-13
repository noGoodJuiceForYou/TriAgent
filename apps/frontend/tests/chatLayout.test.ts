import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const chatViewSource = readFileSync(
  fileURLToPath(new URL("../src/views/ChatView.vue", import.meta.url)),
  "utf8"
);
const composerSource = readFileSync(
  fileURLToPath(new URL("../src/components/ChatComposer.vue", import.meta.url)),
  "utf8"
);
const transcriptSource = readFileSync(
  fileURLToPath(new URL("../src/components/ChatTranscript.vue", import.meta.url)),
  "utf8"
);

describe("chat workspace layout", () => {
  it("allows the transcript grid item to shrink inside the fixed chat viewport", () => {
    expect(chatViewSource).toMatch(
      /\.chat-view__conversation\s*\{[^}]*min-height:\s*0;/s
    );
  });

  it("hides the citation column until an answer requests it", () => {
    expect(chatViewSource).toMatch(
      /\.chat-view\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\);/s
    );
    expect(chatViewSource).toMatch(
      /\.chat-view--with-citations\s*\{\s*grid-template-columns:\s*minmax\(0, 1fr\) minmax\(18rem, 22rem\);/s
    );
    expect(chatViewSource).toContain('v-if="isCitationPanelOpen && selectedCitation"');
    expect(chatViewSource).toContain("citationBySession");
    expect(chatViewSource).toContain("toggleCitationPanel");
    expect(chatViewSource).not.toContain("ChatSessionList");
    expect(chatViewSource).not.toContain("chat-view__mobile-history");
    expect(chatViewSource).not.toContain('aria-label="查看历史对话"');
    expect(chatViewSource).not.toContain("minmax(13rem, 16rem) minmax(0, 1fr)");
  });

  it("keeps the composer fixed and renders user messages like assistant messages", () => {
    expect(composerSource).toMatch(/textarea\s*\{[^}]*resize:\s*none;/s);
    expect(transcriptSource).toMatch(/\.chat-transcript__message--user\s*\{[^}]*justify-content:\s*flex-end;/s);
    expect(transcriptSource).not.toMatch(/\.chat-transcript__message--user \.chat-transcript__message\s*\{/);
    expect(transcriptSource).not.toContain("background: #efefef");
    expect(transcriptSource).toMatch(/\.chat-transcript__message p\s*\{[^}]*overflow-wrap:\s*anywhere;/s);
  });

  it("lets the answer text fill the conversation column", () => {
    expect(transcriptSource).toMatch(
      /\.chat-transcript__message\s*\{[^}]*max-width:\s*100%;/s
    );
    expect(transcriptSource).not.toMatch(
      /\.chat-transcript__message\s*\{[^}]*max-width:\s*min\(46rem/s
    );
    expect(transcriptSource).toMatch(
      /\.chat-transcript__context\s*\{[^}]*max-width:\s*100%;/s
    );
    expect(transcriptSource).not.toMatch(/padding:\s*1\.75rem clamp\(1rem, 4vw, 4\.5rem\)/);
  });

  it("removes focus rectangles from the chat workspace and composer", () => {
    expect(composerSource).not.toContain(".chat-composer__field:focus-within");
    expect(chatViewSource).toMatch(/\.chat-view :deep\(button:focus\)[^}]*outline:\s*none;/s);
    expect(chatViewSource).toContain(".chat-view :deep(textarea:focus-visible)");
  });
});
