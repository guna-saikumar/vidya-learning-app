import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasRole, isStudent } from "./helpers";

describe("role helpers", () => {
  it("detects students", () => {
    assert.equal(isStudent({ role: "STUDENT" }), true);
    assert.equal(isStudent({ role: "ADMIN" }), false);
    assert.equal(isStudent(null), false);
    assert.equal(isStudent(undefined), false);
  });

  it("matches exact roles", () => {
    assert.equal(hasRole({ role: "STUDENT" }, "STUDENT"), true);
    assert.equal(hasRole({ role: "ADMIN" }, "STUDENT"), false);
  });
});
