<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";

import ChatCitationPanel, { type SelectedCitation } from "../components/ChatCitationPanel.vue";
import ChatComposer from "../components/ChatComposer.vue";
import ChatTranscript from "../components/ChatTranscript.vue";
import {
  activeCitationPanel,
  closeCitationPanel,
  pruneCitationPanels,
  selectCitedChunk,
  toggleCitationPanel,
  type CitationStateBySession
} from "../chat/citationPanels";
import {
  openReferenceInNewTab,
  referenceDocumentQuery,
  type ChatReference
} from "../chat/referenceLink";
import { useChatStore } from "../stores/chat";

const chat = useChatStore();
const router = useRouter();
const activeTitle = computed(() =>
  chat.sessions.find((session) => session.id === chat.activeSessionId)?.title ?? "新对话"
);

/** Citation panel state is per conversation: switching sessions restores or collapses it. */
const citationBySession = ref<CitationStateBySession>({});
const activeCitation = computed(() =>
  activeCitationPanel(citationBySession.value, chat.activeSessionId)
);
const openReferencesMessageId = computed(() => activeCitation.value?.messageId ?? null);
const isCitationPanelOpen = computed(() => activeCitation.value !== null);
const selectedCitation = computed<SelectedCitation | null>(() => {
  const state = activeCitation.value;
  if (state === null) return null;
  const reference = state.references.find((item) => item.id === state.selectedReferenceId);
  return reference === undefined ? null : { reference, messageId: state.messageId };
});

onMounted(() => {
  void chat.initialize().catch(() => undefined);
});

watch(
  () => chat.sessions.map((session) => session.id),
  (sessionIds) => {
    citationBySession.value = pruneCitationPanels(citationBySession.value, sessionIds);
  }
);

function run(operation: () => Promise<unknown>): void {
  void operation().catch(() => undefined);
}

function toggleReferences(messageId: string, references: readonly ChatReference[]): void {
  citationBySession.value = toggleCitationPanel(
    citationBySession.value,
    chat.activeSessionId,
    messageId,
    references
  );
}

function selectFromPanel(reference: ChatReference): void {
  citationBySession.value = selectCitedChunk(
    citationBySession.value,
    chat.activeSessionId,
    reference.id
  );
}

function hideReferences(): void {
  citationBySession.value = closeCitationPanel(citationBySession.value, chat.activeSessionId);
}

function openReferenceDocument(reference: ChatReference): void {
  const query = referenceDocumentQuery(reference);
  if (query === null) return;
  openReferenceInNewTab(
    router.resolve({ name: "knowledge", query: { ...query } }).href
  );
}
</script>

<template>
  <section
    class="chat-view"
    :class="{ 'chat-view--with-citations': isCitationPanelOpen }"
    aria-label="对话工作区"
  >
    <div class="chat-view__conversation">
      <header><p>当前对话</p><h2>{{ activeTitle }}</h2></header>
      <ChatTranscript
        :is-loading="chat.isLoading"
        :live-tool-calls="chat.liveToolCalls"
        :messages="chat.messages"
        :open-references-message-id="openReferencesMessageId"
        :tool-audits="chat.toolAudits"
        @toggle-references="toggleReferences"
      />
      <ChatComposer
        :disabled="chat.isLoading"
        :is-sending="chat.isSending"
        :is-updating-memory="chat.isUpdatingMemory"
        :memory="chat.activeSession?.memory ?? null"
        @apply-memory="run(() => chat.updateMemoryMode($event))"
        @compact-memory="run(() => chat.compactMemory())"
        @send="run(() => chat.send($event))"
      />
    </div>
    <ChatCitationPanel
      v-if="isCitationPanelOpen && selectedCitation"
      :references="activeCitation?.references ?? []"
      :selected="selectedCitation"
      @close="hideReferences"
      @open-document="openReferenceDocument"
      @select="selectFromPanel"
    />
  </section>
</template>

<style scoped>
.chat-view { background: var(--surface-raised); display: grid; grid-template-columns: minmax(0, 1fr); height: 100%; overflow: hidden; }
.chat-view--with-citations { grid-template-columns: minmax(0, 1fr) minmax(18rem, 22rem); }
.chat-view__conversation { display: grid; grid-template-rows: auto minmax(0, 1fr) auto; min-height: 0; min-width: 0; }
.chat-view__conversation > header { align-items: center; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; min-height: 3.75rem; padding: 0.75rem clamp(1rem, 3vw, 2rem); }
.chat-view__conversation > header p { color: var(--text-tertiary); font-size: 0.72rem; font-weight: 650; margin: 0; }
.chat-view__conversation > header h2 { font-size: 0.92rem; font-weight: 660; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.chat-view :deep(button:focus), .chat-view :deep(a:focus), .chat-view :deep(input:focus), .chat-view :deep(select:focus), .chat-view :deep(textarea:focus), .chat-view :deep(button:focus-visible), .chat-view :deep(a:focus-visible), .chat-view :deep(input:focus-visible), .chat-view :deep(select:focus-visible), .chat-view :deep(textarea:focus-visible) { outline: none; outline-offset: 0; }
@media (max-width: 1120px) { .chat-view, .chat-view--with-citations { grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr) auto; height: auto; } .chat-view__conversation { min-height: 36rem; } }
</style>


