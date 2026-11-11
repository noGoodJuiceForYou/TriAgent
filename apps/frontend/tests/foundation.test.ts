import { describe, expect, it } from "vitest";

import { buildHealthMessage, getFrontendFoundationHealth } from "../src/foundation";

describe("frontend foundation", () => {
  it("consumes the shared health contract", () => {
    const health = getFrontendFoundationHealth();

    expect(health.service).toBe("triagent-ops-backend");
    expect(buildHealthMessage(health)).toBe("triagent-ops-backend 0.1.0 is ok");
  });
});
