# Lead Navigator AI

Service-business lead intake and voice-workflow prototype, built by Linda Kisimisi.

## Problem and solution

Service businesses need to capture enquiries, prioritize leads and connect follow-up with scheduling. This application combines lead intake, client/admin dashboards, rule-based scoring and Vapi tool handling, with Calendly, SMS and billing adapters.

[Published Lovable preview](https://id-preview--a3c02fa3-5f7e-4f18-9952-cb23304b1200.lovable.app)

This is a prototype with unresolved authorization issues. Use a dedicated synthetic-data environment when reviewing it.

## Implementation

React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query, Supabase Auth/PostgreSQL and Deno Edge Functions.

`vapi-webhook` accepts provider events and tool calls, maps assistant IDs to client configuration, writes leads/calls/events, and applies deterministic qualification scores. It can request Calendly availability and scheduling links and submit SMS through the Lovable Twilio gateway. Scheduling links do not establish a completed Calendly booking. PayPal configuration and approval adapters also exist; paid subscriptions and delivered messages were not tested in this review.

The lead score uses explicit weights for timeline, budget, property and decision-maker status. It is rule-based rather than an LLM prediction. A connected Vapi assistant supplies the conversational layer; no locally implemented LLM inference endpoint was found in this repository.

## Security boundaries requiring work

- Early migrations grant public read/write access to leads, calls, appointments, settings and integrations. Later client-scoped policies do not remove these permissive policies.
- The role insertion policy permits client admins without restricting the requested role or client scope.
- The Vapi webhook uses a service-role client without an in-function provider-secret/signature check.
- SMS and Calendly functions use privileged clients without verifying the caller or client ownership in function code.
- Gateway defaults are not equivalent to application authorization. The checked-in configuration does not establish the deployed policies for these endpoints.
- Browser configuration contains a public anon key, not a service-role secret. Public keys remain unsafe when database policies permit unwanted access.

See [security review](docs/security-review.md). Tenant isolation and production readiness must not be claimed until these issues are addressed and tested.

## Local setup

```bash
npm ci
cp .env.example .env.local
npm run dev
npm run build
npm run test
npm run lint
```

Use a separate development Supabase project. Review and harden migrations before applying them; do not use the migration set as-is for real customer data. The public `VITE_*` values are supplied through `.env.local`. Existing tracked public configuration is retained for deployment compatibility.

Backend dependencies include Supabase runtime keys, `CALENDLY_API_TOKEN`, and the Lovable/Twilio connection variables used in the functions. Store provider credentials server-side. A frontend install alone does not provision those integrations. The current example test is a scaffold.

## Implementation evidence

- [Rule-based scoring and voice tool handler](supabase/functions/vapi-webhook/index.ts)
- [Calendly adapter](supabase/functions/calendly-proxy/index.ts)
- [SMS adapter](supabase/functions/send-sms/index.ts)
- [Initial permissive policies](supabase/migrations/20260407185346_5ee65da1-1027-4fa8-8c85-75dfee94d418.sql)
- [Later client policies](supabase/migrations/20260407213849_482de4eb-b605-41da-a208-1a89ef8bfffa.sql)

Matching GitHub and Lovable handler files were inspected. This source review did not invoke voice tools, submit payments, send SMS or query live customer records.
