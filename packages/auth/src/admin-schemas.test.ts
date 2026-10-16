import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  adminForgotPasswordSchema,
  adminLoginSchema,
  adminRegisterSchema,
  adminResetPasswordSchema,
  adminUserSchema,
  adminVerifyEmailSchema,
} from "./admin-schemas";

const email = "admin@vidya.edu.in";

describe("admin auth request schemas", () => {
  it("accepts a valid register body and trims/normalizes it", () => {
    const parsed = adminRegisterSchema.parse({
      name: "  Dr. Ramesh Sharma ",
      email: "  Admin@Vidya.EDU.in ",
      password: "AdminDemo1!",
      department: "  Academic Director  ",
    });
    assert.deepEqual(parsed, {
      name: "Dr. Ramesh Sharma",
      email,
      password: "AdminDemo1!",
      department: "Academic Director",
    });
  });

  it("rejects an invalid register body", () => {
    assert.equal(
      adminRegisterSchema.safeParse({
        name: "",
        email: "not-an-email",
        password: "short",
      }).success,
      false
    );
  });

  it("accepts a valid verify-email body", () => {
    assert.equal(
      adminVerifyEmailSchema.safeParse({ email, otp: "123456" }).success,
      true
    );
  });

  it("rejects a verify-email body with a non 6-digit OTP", () => {
    assert.equal(
      adminVerifyEmailSchema.safeParse({ email, otp: "12ab56" }).success,
      false
    );
  });

  it("accepts a valid login body", () => {
    assert.equal(
      adminLoginSchema.safeParse({ email, password: "AdminDemo1!" }).success,
      true
    );
  });

  it("rejects a login body without a password", () => {
    assert.equal(adminLoginSchema.safeParse({ email }).success, false);
  });

  it("accepts a valid forgot-password body", () => {
    assert.equal(adminForgotPasswordSchema.safeParse({ email }).success, true);
  });

  it("rejects a forgot-password body with a missing email", () => {
    assert.equal(adminForgotPasswordSchema.safeParse({}).success, false);
  });

  it("accepts a valid reset-password body", () => {
    assert.equal(
      adminResetPasswordSchema.safeParse({
        email,
        otp: "123456",
        newPassword: "AdminDemo1!",
      }).success,
      true
    );
  });

  it("rejects a reset-password body with a short new password", () => {
    assert.equal(
      adminResetPasswordSchema.safeParse({
        email,
        otp: "123456",
        newPassword: "short",
      }).success,
      false
    );
  });
});

describe("admin auth response schemas", () => {
  it("accepts ADMIN and SUPER_ADMIN admin users", () => {
    for (const role of ["ADMIN", "SUPER_ADMIN"] as const) {
      assert.equal(
        adminUserSchema.safeParse({ id: "user_1", name: "Admin", email, role })
          .success,
        true
      );
    }
  });

  it("rejects a student role on the admin user schema", () => {
    assert.equal(
      adminUserSchema.safeParse({
        id: "user_1",
        name: "Student",
        email,
        role: "STUDENT",
      }).success,
      false
    );
  });
});
