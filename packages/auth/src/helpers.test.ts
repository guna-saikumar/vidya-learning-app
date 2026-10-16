import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hasRole, isAdmin, isStudent, isSuperAdmin } from "./helpers";

describe("admin role helpers", () => {
  it("treats ADMIN and SUPER_ADMIN as admins", () => {
    assert.equal(isAdmin({ role: "ADMIN" }), true);
    assert.equal(isAdmin({ role: "SUPER_ADMIN" }), true);
  });

  it("does not treat students as admins", () => {
    assert.equal(isAdmin({ role: "STUDENT" }), false);
    assert.equal(isAdmin(null), false);
    assert.equal(isAdmin(undefined), false);
  });

  it("detects super admins only", () => {
    assert.equal(isSuperAdmin({ role: "SUPER_ADMIN" }), true);
    assert.equal(isSuperAdmin({ role: "ADMIN" }), false);
  });

  it("still detects students and exact roles", () => {
    assert.equal(isStudent({ role: "STUDENT" }), true);
    assert.equal(isStudent({ role: "ADMIN" }), false);
    assert.equal(hasRole({ role: "SUPER_ADMIN" }, "SUPER_ADMIN"), true);
    assert.equal(hasRole({ role: "ADMIN" }, "SUPER_ADMIN"), false);
  });
});
