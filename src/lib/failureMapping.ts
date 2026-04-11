export interface FailureInfo {
  title: string;
  explanation: string;
  severity: "warning" | "critical";
  likelyCause: string;
  recommendedAction: string;
  actionRoute?: string;
  actionLabel?: string;
  retryAction?: string;
}

export const failureMap: Record<string, FailureInfo> = {
  sms_failed: {
    title: "SMS alert not delivered",
    explanation: "A lead notification could not be sent via text message.",
    severity: "critical",
    likelyCause: "Invalid recipient number, Twilio misconfiguration, or service outage.",
    recommendedAction: "Check the recipient phone number in notification settings.",
    actionRoute: "/client/settings",
    actionLabel: "Update SMS recipients",
    retryAction: "test_sms",
  },
  booking_failed: {
    title: "Appointment booking failed",
    explanation: "The system could not create a calendar booking for a lead.",
    severity: "critical",
    likelyCause: "Calendar disconnected, no available slots, or a Calendly API error.",
    recommendedAction: "Reconnect your calendar or adjust your availability.",
    actionRoute: "/scheduling",
    actionLabel: "Reconnect calendar",
    retryAction: "test_calendar",
  },
  webhook_error: {
    title: "Webhook processing error",
    explanation: "An incoming webhook event could not be processed.",
    severity: "warning",
    likelyCause: "Invalid payload format or a handler error.",
    recommendedAction: "Review webhook details and rerun a test event.",
    actionRoute: "/admin/logs",
    actionLabel: "View logs",
    retryAction: "test_webhook",
  },
  integration_failed: {
    title: "Integration connection issue",
    explanation: "A connected service could not be reached.",
    severity: "critical",
    likelyCause: "Expired API token or missing configuration.",
    recommendedAction: "Reconnect the integration in settings.",
    actionRoute: "/client/settings",
    actionLabel: "Reconnect integration",
  },
  invalid_payload: {
    title: "Invalid event data",
    explanation: "An incoming event was missing required fields.",
    severity: "warning",
    likelyCause: "The calling service sent incomplete or unexpected data.",
    recommendedAction: "Inspect the payload and retry with a test event.",
    actionRoute: "/admin/logs",
    actionLabel: "View details",
  },
  escalation_failed: {
    title: "Escalation could not be sent",
    explanation: "A lead needed human attention but the escalation contact was not reachable.",
    severity: "critical",
    likelyCause: "No escalation contact configured or phone number is invalid.",
    recommendedAction: "Update your escalation contact in notification settings.",
    actionRoute: "/notifications",
    actionLabel: "Update escalation settings",
  },
};

export function getFailureInfo(eventType: string): FailureInfo {
  return failureMap[eventType] || {
    title: "Something went wrong",
    explanation: "An unexpected error occurred during processing.",
    severity: "warning" as const,
    likelyCause: "Unknown cause.",
    recommendedAction: "Check the event logs for more details.",
    actionRoute: "/admin/logs",
    actionLabel: "View logs",
  };
}
