import {
  EMPTY_INQUIRY,
  INQUIRY_MESSAGES,
  getInquiryDestination,
  validateInquiry,
  type InquiryFieldName,
  type InquiryFormState,
  type InquiryPayload,
} from "./inquiry.ts";

function readTypedValues(formData: FormData): InquiryPayload {
  const entries = (Object.keys(EMPTY_INQUIRY) as InquiryFieldName[]).map((name) => {
    const value = formData.get(name);
    return [name, typeof value === "string" ? value : ""] as const;
  });
  return Object.fromEntries(entries) as InquiryPayload;
}

export type InquirySubmissionOptions = {
  enabled: boolean;
  disabledMessage: string;
  webhookUrl?: string;
  deliver: (destination: string, inquiry: InquiryPayload) => Promise<boolean>;
};

export async function resolveInquirySubmission(
  previousState: InquiryFormState,
  formData: FormData,
  options: InquirySubmissionOptions,
): Promise<InquiryFormState> {
  if (!options.enabled) {
    return {
      status: "error",
      message: options.disabledMessage,
      fieldErrors: {},
      values: readTypedValues(formData),
      revision: previousState.revision + 1,
    };
  }

  const honeypot = formData.get("companyWebsite");
  if (typeof honeypot === "string" && honeypot.trim()) {
    return {
      status: "success",
      message: INQUIRY_MESSAGES.success,
      fieldErrors: {},
      values: EMPTY_INQUIRY,
      revision: previousState.revision + 1,
    };
  }

  const result = validateInquiry(formData);
  if (!result.ok) {
    return {
      status: "validation",
      message: INQUIRY_MESSAGES.validation,
      fieldErrors: result.fieldErrors,
      values: result.data,
      revision: previousState.revision + 1,
    };
  }

  const destination = getInquiryDestination({
    BMP_INQUIRY_WEBHOOK_URL: options.webhookUrl,
  });
  if (!destination) {
    return {
      status: "error",
      message: INQUIRY_MESSAGES.error,
      fieldErrors: {},
      values: result.data,
      revision: previousState.revision + 1,
    };
  }

  if (await options.deliver(destination, result.data)) {
    return {
      status: "success",
      message: INQUIRY_MESSAGES.success,
      fieldErrors: {},
      values: EMPTY_INQUIRY,
      revision: previousState.revision + 1,
    };
  }

  return {
    status: "error",
    message: INQUIRY_MESSAGES.error,
    fieldErrors: {},
    values: result.data,
    revision: previousState.revision + 1,
  };
}
