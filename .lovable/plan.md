

## Twilio SMS Alert System for Hot Leads

### Overview
Add SMS notifications via Twilio when Hot leads are captured, a settings page to manage notifications, and SMS logging. Twilio is available as a connector, so we'll use the connector gateway instead of raw Twilio credentials.

### Step 1: Connect Twilio
Use the Twilio connector (`standard_connectors--connect`) to link Twilio to the project. This provides `TWILIO_API_KEY` and `LOVABLE_API_KEY` environment variables automatically. Then use `add_secret` to store `TWILIO_PHONE_NUMBER` and `SALES_REP_PHONE` as secrets.

### Step 2: Database Migration
Create two new tables and enable realtime:

**settings** - key-value store for app configuration
- `id` (uuid, PK, default gen_random_uuid())
- `key` (text, unique, not null)
- `value` (text)
- `created_at` (timestamptz, default now())
- RLS: public read/insert/update

**sms_logs** - tracks sent SMS alerts
- `id` (uuid, PK, default gen_random_uuid())
- `lead_id` (uuid, FK to leads, nullable)
- `phone_sent_to` (text, not null)
- `content` (text, not null)
- `status` (text, not null, default 'pending')
- `twilio_sid` (text, nullable)
- `created_at` (timestamptz, default now())
- RLS: public read/insert

Enable realtime on both tables.

### Step 3: Create `send-sms` Edge Function
New edge function `supabase/functions/send-sms/index.ts` that:
- Accepts POST with `{ to, body, leadId? }`
- Calls Twilio via connector gateway: `https://connector-gateway.lovable.dev/twilio/Messages.json`
- Uses `application/x-www-form-urlencoded` format
- Reads `TWILIO_PHONE_NUMBER` from env for the `From` number
- Logs result to `sms_logs` table
- Returns success/failure status

### Step 4: Update `vapi-webhook` Edge Function
After successfully inserting a Hot lead in `collectLeadInfo`:
- Check settings table for `sms_alerts_enabled` = `"true"`
- Read `sales_rep_phone` from settings table
- If enabled and phone exists, send SMS via the `send-sms` function (or inline the Twilio gateway call)
- Format: `"🔥 HOT LEAD: [Name] needs [serviceType] [timeline]. Score: [score]/100. Call: [phone]. Ref: [leadID]"`
- Wrap in try/catch so SMS failure doesn't break the webhook response

### Step 5: Create `/settings/notifications` Page
New file `src/pages/NotificationSettings.tsx` with:
- **Toggle switch** (shadcn Switch) to enable/disable Hot lead SMS alerts — reads/writes `sms_alerts_enabled` in settings table
- **Phone input** for sales rep number — reads/writes `sales_rep_phone` in settings table
- **Twilio phone display** showing the configured sender number (read from edge function or hardcoded display)
- **Test SMS button** that invokes the `send-sms` edge function with a test message
- **Connection status indicator** (Badge) showing if Twilio is connected
- **SMS history table** (shadcn Table) showing recent sms_logs entries with lead name, phone, status, timestamp

### Step 6: Update Dashboard with Notifications
In `LeadsDashboard.tsx`:
- Add a notification badge (Bell icon) in the header showing count of Hot leads created in last 24h
- Add browser notification support: when a new Hot lead arrives via realtime subscription, show a browser `Notification` and optionally play a sound
- Add a Settings icon/link in the header navigating to `/settings/notifications`

### Step 7: Update Routing
In `App.tsx`, add route: `<Route path="/settings/notifications" element={<NotificationSettings />} />`

Update `Index.tsx` to add a Settings link.

### Technical Details
- Twilio gateway URL: `https://connector-gateway.lovable.dev/twilio/Messages.json`
- Headers: `Authorization: Bearer ${LOVABLE_API_KEY}`, `X-Connection-Api-Key: ${TWILIO_API_KEY}`
- Body format: `URLSearchParams({ To, From, Body })`
- Settings table uses simple key-value pairs queried via `supabase.from("settings").select("*").eq("key", "...")`
- SMS logs queried with join to leads for display names

