"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useRef,
  useState,
  startTransition,
  type FormEvent,
} from "react";

import { submitInquiry } from "@/app/contact/actions";
import { CONTACT } from "@/content/contact";
import {
  INITIAL_INQUIRY_STATE,
  INQUIRY_FIELD_LIMITS,
  INQUIRY_MESSAGES,
  validateInquiry,
  type InquiryFieldErrors,
  type InquiryFieldName,
} from "@/lib/contact/inquiry";
import { EXPERIMENT_INQUIRY_ENABLED } from "@/lib/contact/experiment-policy";

const FIELD_AUTOCOMPLETE: Record<InquiryFieldName, string> = {
  name: "name",
  business: "organization",
  contact: "email",
  project: "off",
  reference: "url",
  budget: "off",
  timeline: "off",
};

const WIDE_FIELDS = new Set<InquiryFieldName>([
  "contact",
  "project",
  "reference",
]);

export function ContactForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLParagraphElement>(null);
  const [state, formAction, pending] = useActionState(
    submitInquiry,
    INITIAL_INQUIRY_STATE,
  );
  const [clientErrors, setClientErrors] = useState<InquiryFieldErrors>({});
  const [validationActive, setValidationActive] = useState(false);

  const visibleErrors = validationActive
    ? clientErrors
    : state.status === "validation"
      ? state.fieldErrors
      : {};
  const hasClientErrors = Object.keys(clientErrors).length > 0;
  const statusMessage = validationActive && hasClientErrors
    ? INQUIRY_MESSAGES.validation
    : pending
      ? "Sending your project inquiry…"
      : state.message;
  const statusTone = validationActive && hasClientErrors ? "validation" : state.status;

  useEffect(() => {
    if (state.revision > 0) statusRef.current?.focus();
  }, [state.revision]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const result = validateInquiry(new FormData(form));
    if (result.ok) {
      event.preventDefault();
      setValidationActive(false);
      setClientErrors({});
      startTransition(() => formAction(new FormData(form)));
      return;
    }

    event.preventDefault();
    setValidationActive(true);
    setClientErrors(result.fieldErrors);
    const firstInvalidName = Object.keys(result.fieldErrors)[0];
    requestAnimationFrame(() => {
      const field = form.elements.namedItem(firstInvalidName);
      if (field instanceof HTMLElement) field.focus();
    });
  }

  function handleInput(event: FormEvent<HTMLFormElement>) {
    if (!validationActive) return;
    const result = validateInquiry(new FormData(event.currentTarget));
    setClientErrors(result.ok ? {} : result.fieldErrors);
  }

  return (
    <div className="bmp-contact__grid">
      <form
        key={state.revision}
        ref={formRef}
        action={formAction}
        className="bmp-contact-form"
        data-form-revision={state.revision}
        data-submission-status={CONTACT.submission.status}
        onSubmit={handleSubmit}
        onInput={handleInput}
        noValidate
      >
        <p className="bmp-contact-form__legend">
          Fields marked <strong>Required</strong> help us review the problem. The rest are optional.
        </p>
        {!EXPERIMENT_INQUIRY_ENABLED ? (
          <p className="bmp-contact-form__notice" role="status">
            Preview: form submissions are unavailable. Please use one of the direct contact
            options instead.
          </p>
        ) : null}
        {CONTACT.fields.map((field, index) => {
          const id = `contact-${field.name.value}`;
          const name = field.name.value as InquiryFieldName;
          const error = visibleErrors[name];
          const errorId = `${id}-error`;
          const commonProps = {
            id,
            name,
            required: field.required.value,
            autoComplete: FIELD_AUTOCOMPLETE[name],
            maxLength: INQUIRY_FIELD_LIMITS[name],
            defaultValue: state.values[name],
            "aria-invalid": Boolean(error),
            "aria-describedby": error ? errorId : undefined,
          };

          return (
            <div
              key={field.name.value}
              className="bmp-contact-form__field"
              data-field-index={String(index + 1).padStart(2, "0")}
              data-field-layout={WIDE_FIELDS.has(name) ? "wide" : "standard"}
            >
              <label htmlFor={id}>
                <span>{field.label.value}</span>
                <small>{field.required.value ? "Required" : "Optional"}</small>
              </label>
              {field.kind.value === "textarea" ? (
                <textarea {...commonProps} rows={4} />
              ) : (
                <input
                  {...commonProps}
                  type={field.kind.value}
                  inputMode={field.kind.value === "email" ? "email" : undefined}
                />
              )}
              {error ? (
                <small id={errorId} className="bmp-contact-form__error">
                  {error}
                </small>
              ) : null}
            </div>
          );
        })}

        <div className="bmp-contact-form__honeypot" aria-hidden="true">
          <label htmlFor="contact-company-website">Company website</label>
          <input
            id="contact-company-website"
            name="companyWebsite"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <button type="submit" disabled={pending || !EXPERIMENT_INQUIRY_ENABLED}>
          {!EXPERIMENT_INQUIRY_ENABLED
            ? "Preview: submissions unavailable"
            : pending
              ? "Sending…"
              : CONTACT.primaryAction.label.value}
        </button>
        <p
          ref={statusRef}
          className="bmp-contact-form__status"
          data-status={statusTone}
          role={statusTone === "error" || statusTone === "validation" ? "alert" : "status"}
          aria-label="Project inquiry status"
          aria-live="polite"
          tabIndex={-1}
        >
          {statusMessage}
        </p>
      </form>

      <aside className="bmp-contact__aside">
        <Link href={CONTACT.secondaryAction.href.value} className="bmp-contact__work-link">
          <span>{CONTACT.secondaryAction.label.value}</span>
          <span aria-hidden="true">↗</span>
        </Link>
        <ol className="bmp-contact__channels">
          {CONTACT.directChannels.value.map((channel, index) => (
            <li key={channel.label}>
              <a href={channel.href} target="_blank" rel="noopener noreferrer">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{channel.label}</strong>
                <small>{channel.descriptor}</small>
                <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
