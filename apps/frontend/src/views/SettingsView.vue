<script setup lang="ts">
import { onMounted } from "vue";

import ChatPromptSidebar from "../components/ChatPromptSidebar.vue";
import ChatSkillSidebar from "../components/ChatSkillSidebar.vue";
import { useChatStore } from "../stores/chat";

const chat = useChatStore();

onMounted(() => {
  if (chat.configuration === null) {
    void chat.loadConfiguration().catch(() => undefined);
  }
});

function run(operation: () => Promise<unknown>): void {
  void operation().catch(() => undefined);
}

function saveChatConfiguration(systemPromptId: string, skillIds: readonly string[]): void {
  run(() => chat.saveConfiguration(systemPromptId, skillIds));
}
</script>

<template>
  <section class="settings-view" aria-label="系统设置">
    <header class="settings-view__intro">
      <p>系统设置</p>
      <h2>对话装配配置</h2>
      <p class="settings-view__hint">
        系统提示词与 Skill 属于账号级配置，会应用到你的所有对话会话。保存时两部分同时生效，请确认后再切换。
      </p>
    </header>
    <div class="settings-view__grid">
      <section class="settings-view__card" aria-label="对话系统提示词设置">
        <ChatPromptSidebar
          :configuration="chat.configuration"
          :is-saving="chat.isSavingConfiguration"
          @create-prompt="(label, content) => run(() => chat.createPrompt(label, content))"
          @delete-prompt="run(() => chat.deletePrompt($event))"
          @save="saveChatConfiguration"
          @update-prompt="(promptId, label, content) => run(() => chat.updatePrompt(promptId, label, content))"
        />
      </section>
      <section class="settings-view__card" aria-label="Skill 设置">
        <ChatSkillSidebar
          :configuration="chat.configuration"
          :is-saving="chat.isSavingConfiguration"
          @delete-skill="run(() => chat.deleteSkill($event))"
          @save="saveChatConfiguration"
          @upload-skill="run(() => chat.uploadSkill($event))"
        />
      </section>
    </div>
  </section>
</template>

<style scoped>
.settings-view { background: var(--surface-raised); display: grid; gap: 1.25rem; grid-auto-rows: max-content; height: 100%; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 1.75rem clamp(1rem, 4vw, 4.5rem); scrollbar-color: var(--line-strong) transparent; }
.settings-view__intro p { color: var(--text-tertiary); font-size: 0.72rem; font-weight: 650; margin: 0; }
.settings-view__intro h2 { font-size: 1.15rem; font-weight: 720; margin: 0.2rem 0 0.4rem; }
.settings-view__hint { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.65; margin: 0; max-width: 52rem; }
.settings-view__grid { align-items: start; display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.settings-view__card { border: 1px solid var(--line); border-radius: var(--radius-md); overflow: hidden; }
.settings-view__card :deep(.chat-prompt-sidebar), .settings-view__card :deep(.chat-skill-sidebar) { border: 0; }
.settings-view :deep(button:focus), .settings-view :deep(a:focus), .settings-view :deep(input:focus), .settings-view :deep(select:focus), .settings-view :deep(textarea:focus), .settings-view :deep(button:focus-visible), .settings-view :deep(a:focus-visible), .settings-view :deep(input:focus-visible), .settings-view :deep(select:focus-visible), .settings-view :deep(textarea:focus-visible) { outline: none; outline-offset: 0; }
@media (max-width: 1120px) { .settings-view { height: auto; } .settings-view__grid { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 640px) { .settings-view { padding: 1.15rem 0; } }
</style>
