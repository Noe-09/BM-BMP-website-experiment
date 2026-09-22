"use server";

import type { InquiryFormState } from "@/lib/contact/inquiry";
import { deliverInquiry } from "@/lib/contact/delivery";
import {
  EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
  EXPERIMENT_INQUIRY_ENABLED,
} from "@/lib/contact/experiment-policy";
import { resolveInquirySubmission } from "@/lib/contact/submission";

export async function submitInquiry(
  previousState: InquiryFormState,
  formData: FormData,
): Promise<InquiryFormState> {
  return resolveInquirySubmission(previousState, formData, {
    enabled: EXPERIMENT_INQUIRY_ENABLED,
    disabledMessage: EXPERIMENT_INQUIRY_DISABLED_MESSAGE,
    webhookUrl: process.env.BMP_INQUIRY_WEBHOOK_URL,
    deliver: deliverInquiry,
  });
}
