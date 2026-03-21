// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { runCapture } = require("../bin/lib/runner");

describe("runner env merging", () => {
  it("preserves process env when opts.env is provided", () => {
    const originalGateway = process.env.OPENSHELL_GATEWAY;
    process.env.OPENSHELL_GATEWAY = "nemoclaw";
    try {
      const output = runCapture("printf '%s %s' \"$OPENSHELL_GATEWAY\" \"$OPENAI_API_KEY\"", {
        env: { OPENAI_API_KEY: "sk-test-secret" },
      });
      assert.equal(output, "nemoclaw sk-test-secret");
    } finally {
      if (originalGateway === undefined) {
        delete process.env.OPENSHELL_GATEWAY;
      } else {
        process.env.OPENSHELL_GATEWAY = originalGateway;
      }
    }
  });
});
