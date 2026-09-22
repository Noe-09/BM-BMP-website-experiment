import assert from "node:assert/strict";
import test from "node:test";

import {
  EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
  EXPERIMENT_INQUIRY_ENABLED,
} from "../lib/contact/experiment-policy.ts";
import { INITIAL_INQUIRY_STATE } from "../lib/contact/inquiry.ts";
import { resolveInquirySubmission } from "../lib/contact/submission.ts";

function validInquiryFormData(overrides = {}) {
  const values = {
    name: "Noe",
    business: "BMP",
    contact: "noe@example.com",
    project: "Testing the experiment contact guard.",
    ...overrides,
  };
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  return formData;
}

test("preview inquiry cannot be enabled by an inherited webhook", () => {
  assert.equal(EXPERIMENT_INQUIRY_ENABLED, false);
});

test("the experiment wiring always resolves through the disabled policy", async () => {
  let deliverCalled = false;
  const result = await resolveInquirySubmission(
    INITIAL_INQUIRY_STATE,
    validInquiryFormData(),
    {
      enabled: EXPERIMENT_INQUIRY_ENABLED,
      disabledMessage: EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
      webhookUrl: "https://example.com/inherited-webhook",
      deliver: async () => {
        deliverCalled = true;
        return true;
      },
    },
  );

  assert.equal(result.status, "error");
  assert.equal(result.message, EXPERIMENT_INQUIRY_DISABLED_MESSAGE);
  assert.equal(result.values.name, "Noe");
  assert.equal(result.values.project, "Testing the experiment contact guard.");
  assert.equal(result.revision, INITIAL_INQUIRY_STATE.revision + 1);
  assert.equal(deliverCalled, false);
});

test("the disabled policy fails closed even for an otherwise-valid honeypot submission", async () => {
  const formData = new FormData();
  formData.set("companyWebsite", "https://spam.example.com");
  formData.set("name", "Noe");
  let deliverCalled = false;

  const result = await resolveInquirySubmission(INITIAL_INQUIRY_STATE, formData, {
    enabled: false,
    disabledMessage: EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
    webhookUrl: "https://example.com/inherited-webhook",
    deliver: async () => {
      deliverCalled = true;
      return true;
    },
  });

  assert.notEqual(result.status, "success");
  assert.equal(deliverCalled, false);
});

test("sanity: the underlying submission flow still delivers when explicitly enabled (not the experiment's live wiring)", async () => {
  let deliverCalled = false;
  const result = await resolveInquirySubmission(
    INITIAL_INQUIRY_STATE,
    validInquiryFormData(),
    {
      enabled: true,
      disabledMessage: EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
      webhookUrl: "https://example.com/hook",
      deliver: async () => {
        deliverCalled = true;
        return true;
      },
    },
  );

  assert.equal(result.status, "success");
  assert.equal(deliverCalled, true);
});
