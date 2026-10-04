# Security review

Reviewed 4 October 2026 against current GitHub and matching Lovable voice handler.

## Findings

1. Initial public policies on leads, calls, appointments, settings, integrations and logs remain in the checked-in migration sequence. PostgreSQL permissive policies combine with OR, so adding client-scoped policies does not remove broad earlier access.
2. The `user_roles` insert policy allows a caller with `client_admin` to insert rows without binding the requested role/client/user scope. Review privilege escalation paths and restrict role administration.
3. `vapi-webhook` uses service-role access and has no in-function provider signature/shared-secret validation. A known assistant ID is a routing value, not authentication.
4. `send-sms` and `calendly-proxy` use service-role access without an in-function caller/tenant authorization check. Gateway policy must be reviewed, and user actions must resolve ownership server-side.
5. Tracked browser configuration uses an anon-role key. It is public configuration, not a leaked service-role key. Permissive database policies still expose data or writes regardless of whether the public key is removed.
6. Rule-based lead scoring is not AI accuracy evidence. Provider configuration and runtime delivery were not verified.

## Remediation direction

Use a new scoped migration to remove obsolete public policies, restrict role assignment, verify provider callbacks and authenticated client actions, and add cross-tenant negative tests. Review existing demo writes before tightening policies so intended intake still works.

## Scope

Static source review only. Production policies were not queried, vulnerabilities were not exploited, and no messages/payments were sent. This documentation PR does not deploy security fixes. Defer flagship positioning until authorization is hardened.
