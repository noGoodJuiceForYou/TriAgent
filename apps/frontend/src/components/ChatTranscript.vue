<script setup lang="ts">
import { BookOpen, Bot, Wrench } from "lucide-vue-next";

import type { ChatMessage, ToolCallAudit } from "@triagent-ops/api-contracts";
import type { ChatReference } from "../chat/referenceLink";
import type { LiveToolCall } from "../stores/chat";
import AppLoadingState from "./AppLoadingState.vue";
import AsyncStatusBadge from "./AsyncStatusBadge.vue";
import MarkdownContent from "./MarkdownContent.vue";
import UserFeedbackControl from "./UserFeedbackControl.vue";

const emit = defineEmits<{
  "toggle-references": [messageId: string, references: readonly ChatReference[]];
}>();
const props = defineProps<{
  readonly isLoading: boolean;
  readonly liveToolCalls: readonly LiveToolCall[];
  readonly messages: readonly ChatMessage[];
  readonly openReferencesMessageId: string | null;
  readonly toolAudits: readonly ToolCallAudit[];
}>();

function canCollectFeedback(message: ChatMessage): boolean {
  return message.role === "assistant" && !message.id.startsWith("message_draft_");
}

function messageAudits(message: ChatMessage): readonly ToolCallAudit[] {
  const ids = new Set(message.metadata.toolCallIds ?? []);
  return props.toolAudits.filter((audit) => ids.has(audit.id));
}
</script>

<template>
  <section class="chat-transcript" aria-label="当前对话">
    <AppLoadingState v-if="isLoading" label="正在加载对话" />
    <ol v-else-if="messages.length > 0" class="chat-transcript__messages">
      <li v-for="message in messages" :key="message.id" :class="`chat-transcript__message--${message.role}`">
        <article class="chat-transcript__message">
          <span class="chat-transcript__role"><Bot v-if="message.role === 'assistant'" :size="15" aria-hidden="true" />{{ message.role === "assistant" ? "助手" : "你" }}</span>
          <MarkdownContent v-if="message.role === 'assistant'" :content="message.content" />
          <p v-else>{{ message.content }}</p>
          <button
            v-if="message.role === 'assistant' && message.metadata.citations?.length"
            type="button"
            class="chat-transcript__references"
            :aria-expanded="openReferencesMessageId === message.id"
            :aria-label="`${openReferencesMessageId === message.id ? '收起' : '查看'}本次回答的 ${message.metadata.citations.length} 条引用来源`"
            @click="emit('toggle-references', message.id, message.metadata.citations)"
          >
            <BookOpen :size="14" aria-hidden="true" />引用来源（{{ message.metadata.citations.length }}）
          </button>
          <UserFeedbackControl v-if="canCollectFeedback(message)" target-type="chat_message" :target-id="message.id" compact />
          <details v-if="message.role === 'assistant' && messageAudits(message).length" class="chat-transcript__details"><summary><Wrench :size="14" aria-hidden="true" />工具调用（{{ messageAudits(message).length }}）</summary><ul><li v-for="audit in messageAudits(message)" :key="audit.id"><span>{{ audit.toolName }}</span><AsyncStatusBadge :status="audit.status" compact /><small v-if="audit.resultSummary || audit.errorMessage">{{ audit.resultSummary ?? audit.errorMessage }}</small></li></ul></details>
          <details v-if="message.role === 'assistant' && message.metadata.reasoning?.length" class="chat-transcript__details"><summary>深度思考</summary><p>{{ message.metadata.reasoning.join('') }}</p></details>
        </article>
      </li>
    </ol>
    <aside v-if="liveToolCalls.length > 0" class="chat-transcript__context" aria-label="正在进行的工具调用">
      <h2><Wrench :size="15" aria-hidden="true" />工具调用</h2>
      <ul>
        <li v-for="tool in liveToolCalls" :key="tool.id"><span>{{ tool.name }}</span><AsyncStatusBadge :status="tool.status" compact /></li>
      </ul>
    </aside>
  </section>
</template>

<style scoped>
.chat-transcript { display: grid; gap: 1.35rem; min-height: 0; overflow-y: auto; overscroll-behavior: contain; padding: 1.75rem clamp(1rem, 2.5vw, 2rem); scrollbar-color: var(--line-strong) transparent; }
.chat-transcript__messages { display: grid; gap: 1.4rem; list-style: none; margin: 0; padding: 0; }
.chat-transcript__message--user { display: flex; justify-content: flex-end; margin-left: auto; max-width: min(46rem, 92%); }
.chat-transcript__message { max-width: 100%; min-width: 0; }
.chat-transcript__role { align-items: center; color: var(--text-tertiary); display: inline-flex; font-size: 0.72rem; font-weight: 680; gap: 0.35rem; margin-bottom: 0.48rem; }
.chat-transcript__message p { line-height: 1.7; margin: 0; overflow-wrap: anywhere; white-space: pre-wrap; word-break: break-word; }
.chat-transcript__references { align-items: center; background: var(--accent-soft); border: 1px solid var(--accent-border); border-radius: 999px; color: var(--accent-strong); display: inline-flex; font-size: 0.76rem; font-weight: 650; gap: 0.32rem; margin-top: 0.8rem; padding: 0.32rem 0.62rem; transition: background var(--transition-fast), border-color var(--transition-fast); }
.chat-transcript__references:hover { background: #d7f0e7; }
.chat-transcript__references[aria-expanded="true"] { background: var(--accent-strong); border-color: var(--accent-strong); color: #ffffff; }
.chat-transcript__details { border-top: 1px solid var(--line); color: var(--text-secondary); font-size: 0.78rem; margin-top: 0.8rem; padding-top: 0.65rem; }
.chat-transcript__details summary { align-items: center; cursor: pointer; display: flex; font-weight: 700; gap: 0.35rem; }
.chat-transcript__details ul { display: grid; gap: 0.4rem; list-style: none; margin: 0.65rem 0 0; padding: 0; }
.chat-transcript__details li { align-items: center; display: grid; gap: 0.45rem; grid-template-columns: minmax(0, 1fr) auto; }
.chat-transcript__details li small { color: var(--text-tertiary); grid-column: 1 / -1; overflow-wrap: anywhere; }
.chat-transcript__details p { color: var(--text-secondary); font-size: 0.78rem; line-height: 1.6; margin: 0.65rem 0 0; white-space: pre-wrap; }
.chat-transcript__context { background: #fbfbfc; border: 1px solid var(--line); border-radius: var(--radius-md); max-width: 100%; padding: 0.9rem 1rem; }
h2 { align-items: center; color: var(--text-secondary); display: flex; font-size: 0.78rem; font-weight: 700; gap: 0.42rem; margin: 0 0 0.7rem; }
.chat-transcript__context ul { display: grid; gap: 0.42rem; list-style: none; margin: 0; padding: 0; }
.chat-transcript__context li { display: grid; gap: 0.45rem; }
.chat-transcript__context li > span { align-items: center; display: grid; font-size: 0.81rem; gap: 0.25rem; grid-template-columns: auto minmax(0, 1fr); }
.chat-transcript__context li > span small { color: var(--text-secondary); font-size: 0.74rem; grid-column: 1 / -1; overflow-wrap: anywhere; }
.chat-transcript__context li > span svg { color: var(--accent-strong); }
.chat-transcript__context li > span svg + * { min-width: 0; }
@media (max-width: 860px) { .chat-transcript { overflow-y: visible; } }
@media (max-width: 640px) { .chat-transcript { padding: 1.15rem 0; } .chat-transcript__message--user { max-width: 94%; } }
</style>
