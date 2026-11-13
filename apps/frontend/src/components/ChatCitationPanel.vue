<script setup lang="ts">
import { BookOpen } from "lucide-vue-next";
import { computed } from "vue";

import type { ChatReference } from "../chat/referenceLink";
import ChatCitationDetail from "./ChatCitationDetail.vue";

export interface SelectedCitation {
  readonly reference: ChatReference;
  readonly messageId: string;
}

const emit = defineEmits<{
  select: [reference: ChatReference];
  close: [];
  "open-document": [reference: ChatReference];
}>();
const props = defineProps<{
  readonly references: readonly ChatReference[];
  readonly selected: SelectedCitation | null;
}>();

const selectedId = computed(() => props.selected?.reference.id ?? null);

function sourceLabel(reference: ChatReference): string {
  if (reference.knowledgeType === "sop") return "SOP";
  if (reference.knowledgeType === "diagnostic-case") return "故障案例";
  return reference.knowledgeType === "document" || reference.sourceType === "document"
    ? "知识库"
    : reference.sourceType;
}

/** Several chunks of one document share a title, so surface the heading path or chunk index. */
function chunkLabel(reference: ChatReference): string {
  const headingPath = reference.metadata?.["headingPath"];
  if (Array.isArray(headingPath)) {
    const segments = headingPath.filter((item): item is string => typeof item === "string");
    const leaf = segments.at(-1)?.trim();
    if (leaf !== undefined && leaf.length > 0) return leaf;
  }
  if (typeof headingPath === "string" && headingPath.trim().length > 0) return headingPath.trim();
  const chunkIndex = reference.metadata?.["chunkIndex"];
  if (typeof chunkIndex === "number") return `分片 ${chunkIndex + 1}`;
  return reference.chunkId ?? "分片";
}
</script>

<template>
  <aside class="citation-panel" aria-label="本次回答引用">
    <header class="citation-panel__header">
      <h2><BookOpen :size="15" aria-hidden="true" />本次回答引用</h2>
      <span v-if="references.length > 0" class="citation-panel__count">{{ references.length }} 个分片</span>
    </header>
    <p v-if="references.length === 0" class="citation-panel__empty">
      这次回答没有检索到知识库分片。提问与知识库文档相关时，这里会列出命中的 chunk 与排序依据。
    </p>
    <template v-else>
      <ul class="citation-panel__list">
        <li v-for="(reference, index) in references" :key="reference.id">
          <button
            type="button"
            class="citation-panel__item"
            :class="{ 'citation-panel__item--active': reference.id === selectedId }"
            :aria-pressed="reference.id === selectedId"
            :aria-label="`查看 ${reference.title} 的来源详情`"
            @click="emit('select', reference)"
          >
            <span class="citation-panel__index">{{ index + 1 }}</span>
            <span class="citation-panel__meta">
              <span class="citation-panel__type">{{ sourceLabel(reference) }}</span>
              <strong class="citation-panel__title">{{ reference.title }}</strong>
              <small class="citation-panel__chunk">{{ chunkLabel(reference) }}</small>
            </span>
          </button>
        </li>
      </ul>
      <ChatCitationDetail
        v-if="selected"
        :message-id="selected.messageId"
        :reference="selected.reference"
        @close="emit('close')"
        @open-document="emit('open-document', $event)"
      />
    </template>
  </aside>
</template>

<style scoped>
.citation-panel { align-content: start; background: var(--surface-raised); border-left: 1px solid var(--line); display: grid; gap: 0.85rem; grid-auto-rows: max-content; min-height: 0; min-width: 0; overflow-y: auto; overscroll-behavior: contain; padding: 1rem; scrollbar-color: var(--line-strong) transparent; }
.citation-panel__header { align-items: center; display: flex; gap: 0.6rem; justify-content: space-between; }
.citation-panel__header h2 { align-items: center; color: var(--text-primary); display: flex; font-size: 0.86rem; font-weight: 760; gap: 0.42rem; margin: 0; }
.citation-panel__header h2 svg { color: var(--accent-strong); }
.citation-panel__count { color: var(--text-tertiary); font-size: 0.72rem; font-weight: 650; }
.citation-panel__empty { color: var(--text-tertiary); font-size: 0.76rem; line-height: 1.6; margin: 0; }
.citation-panel__list { display: grid; gap: 0.45rem; list-style: none; margin: 0; padding: 0; }
.citation-panel__item { align-items: start; background: var(--surface); border: 1px solid var(--line); border-radius: 0.55rem; display: grid; gap: 0.55rem; grid-template-columns: auto minmax(0, 1fr); padding: 0.55rem 0.65rem; text-align: left; transition: background var(--transition-fast), border-color var(--transition-fast); width: 100%; }
.citation-panel__item:hover { background: var(--surface-hover); border-color: var(--accent-border); }
.citation-panel__item--active { background: var(--accent-soft); border-color: var(--accent-border); }
.citation-panel__index { align-items: center; background: rgb(0 0 0 / 5%); border-radius: 50%; color: var(--text-tertiary); display: inline-flex; font-size: 0.68rem; font-weight: 700; height: 1.35rem; justify-content: center; width: 1.35rem; }
.citation-panel__item--active .citation-panel__index { background: var(--accent-strong); color: #ffffff; }
.citation-panel__meta { display: grid; gap: 0.14rem; min-width: 0; }
.citation-panel__type { color: var(--text-tertiary); font-size: 0.68rem; font-weight: 650; }
.citation-panel__title { color: var(--text-primary); font-size: 0.81rem; font-weight: 650; overflow-wrap: anywhere; }
.citation-panel__chunk { color: var(--text-tertiary); font-size: 0.7rem; overflow-wrap: anywhere; }
@media (max-width: 1120px) { .citation-panel { border-left: 0; border-top: 1px solid var(--line); max-height: 32rem; } }
</style>
