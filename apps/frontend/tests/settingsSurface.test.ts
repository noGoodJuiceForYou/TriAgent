import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const chatViewSource = readFileSync(
  fileURLToPath(new URL("../src/views/ChatView.vue", import.meta.url)),
  "utf8"
);
const settingsViewSource = readFileSync(
  fileURLToPath(new URL("../src/views/SettingsView.vue", import.meta.url)),
  "utf8"
);
const routerSource = readFileSync(
  fileURLToPath(new URL("../src/router/index.ts", import.meta.url)),
  "utf8"
);
const workspaceSource = readFileSync(
  fileURLToPath(new URL("../src/layouts/WorkspaceLayout.vue", import.meta.url)),
  "utf8"
);

describe("system settings surface", () => {
  it("keeps prompt and skill configuration out of the chat view", () => {
    expect(chatViewSource).not.toContain("ChatPromptSidebar");
    expect(chatViewSource).not.toContain("ChatSkillSidebar");
    expect(chatViewSource).toContain("ChatCitationPanel");
    expect(chatViewSource).toContain("openReferenceInNewTab");
    expect(chatViewSource).not.toContain("router.push");
  });

  it("hosts both assembly panels on a dedicated settings route", () => {
    expect(settingsViewSource).toContain("ChatPromptSidebar");
    expect(settingsViewSource).toContain("ChatSkillSidebar");
    expect(routerSource).toContain('path: "settings"');
    expect(routerSource).toContain('title: "系统设置"');
    expect(routerSource).toContain("SettingsView");
  });

  it("keeps the five-entry mobile navigation on one row", () => {
    expect(workspaceSource).toMatch(
      /\.workspace-layout__mobile-nav :deep\(\.workspace-navigation\)\s*\{[^}]*repeat\(5, 1fr\);/s
    );
  });
});
