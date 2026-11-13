// @vitest-environment jsdom

import { mount } from "@vue/test-utils";
import { createPinia } from "pinia";
import { describe, expect, it, vi } from "vitest";

import type { ReferenceSourceSseEvent } from "@triagent-ops/api-contracts";

import ChatCitationPanel from "../src/components/ChatCitationPanel.vue";
import WorkspaceNavigation from "../src/components/WorkspaceNavigation.vue";
import {
  openReferenceInNewTab,
  referenceDocumentQuery,
  type ChatReference
} from "../src/chat/referenceLink";

const reference: ChatReference = {
  id: "reference_1",
  title: "Restart runbook",
  sourceType: "document",
  knowledgeType: "sop",
  documentId: "doc_1",
  knowledgeBaseId: "kb_1",
  excerpt: "Restart the API after validating the deployment health.",
  score: 0.94,
  vectorRank: 2,
  vectorScore: 0.87,
  bm25Rank: 1,
  bm25Score: 4.21,
  rerankRank: 1,
  rerankScore: 0.94
} as ReferenceSourceSseEvent["reference"];

const pinia = { plugins: [createPinia()] };

describe("chat citation panel", () => {
  it("lists the answer chunks on the right and shows the selected detail", () => {
    const wrapper = mount(ChatCitationPanel, {
      props: { references: [reference], selected: { reference, messageId: "message_1" } },
      global: pinia
    });

    expect(wrapper.attributes("aria-label")).toBe("本次回答引用");
    expect(wrapper.text()).toContain("1 个分片");
    expect(wrapper.text()).toContain("SOP");
    expect(wrapper.text()).toContain("Restart runbook");
    expect(wrapper.text()).toContain("Restart the API after validating the deployment health.");
    expect(
      wrapper.get('button[aria-label="查看 Restart runbook 的来源详情"]').attributes("aria-pressed")
    ).toBe("true");
  });

  it("explains the empty state and emits selection for another chunk", async () => {
    const empty = mount(ChatCitationPanel, {
      props: { references: [], selected: null },
      global: pinia
    });
    expect(empty.text()).toContain("这次回答没有检索到知识库分片");
    expect(empty.find('button[aria-label^="查看"]').exists()).toBe(false);

    const wrapper = mount(ChatCitationPanel, {
      props: {
        references: [reference, { ...reference, id: "reference_2", title: "Second runbook" }],
        selected: { reference, messageId: "message_1" }
      },
      global: pinia
    });

    await wrapper.get('button[aria-label="查看 Second runbook 的来源详情"]').trigger("click");
    expect(wrapper.emitted("select")?.[0]?.[0]).toMatchObject({ id: "reference_2" });
  });

  it("re-emits document opening so the chat view can launch a separate tab", async () => {
    const wrapper = mount(ChatCitationPanel, {
      props: { references: [reference], selected: { reference, messageId: "message_1" } },
      global: pinia
    });

    await wrapper.get('button[aria-label="在知识库中打开 Restart runbook"]').trigger("click");
    expect(wrapper.emitted("open-document")?.[0]?.[0]).toMatchObject({ documentId: "doc_1" });
  });

  it("exposes the settings entry in the workspace navigation", () => {
    const wrapper = mount(WorkspaceNavigation, {
      props: { activePath: "/settings" },
      global: {
        stubs: {
          RouterLink: { props: ["to"], template: '<a :href="to"><slot /></a>' }
        }
      }
    });

    expect(wrapper.text()).toContain("系统设置");
    expect(wrapper.get('[aria-current="page"]').attributes("href")).toBe("/settings");
  });
});

describe("reference document links", () => {
  it("builds a knowledge route query only for indexed documents", () => {
    expect(referenceDocumentQuery(reference)).toEqual({
      documentId: "doc_1",
      knowledgeBaseId: "kb_1"
    });
    const withoutDocument: ChatReference = {
      id: "reference_2",
      title: "Runbook without a document",
      sourceType: "document"
    };
    expect(referenceDocumentQuery(withoutDocument)).toBeNull();
    expect(
      referenceDocumentQuery({ ...withoutDocument, documentId: "doc_1", knowledgeBaseId: "" })
    ).toBeNull();
  });

  it("opens the resolved document in a new tab", () => {
    const opener = vi.fn().mockReturnValue({});
    expect(openReferenceInNewTab("/knowledge?documentId=doc_1", opener)).toBe(true);
    expect(opener).toHaveBeenCalledWith(
      "/knowledge?documentId=doc_1",
      "_blank",
      "noopener,noreferrer"
    );

    const blocked = vi.fn().mockReturnValue(null);
    expect(openReferenceInNewTab("/knowledge?documentId=doc_1", blocked)).toBe(false);
  });
});
