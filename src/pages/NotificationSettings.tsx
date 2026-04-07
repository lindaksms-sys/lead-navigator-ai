import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Bell, Send, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface SmsLog {
  id: string;
  phone_sent_to: string;
  content: string;
  status: string;
  twilio_sid: string | null;
  created_at: string;
  lead_id: string | null;
}

export default function NotificationSettings() {
  const navigate = useNavigate();
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [salesPhone, setSalesPhone] = useState("");
  const [smsLogs, setSmsLogs] = useState<SmsLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: settings } = await supabase
        .from("settings")
        .select("*")
        .in("key", ["sms_alerts_enabled", "sales_rep_phone"]);

      if (settings) {
        const enabled = settings.find((s) => s.key === "sms_alerts_enabled");
        const phone = settings.find((s) => s.key === "sales_rep_phone");
        if (enabled) setSmsEnabled(enabled.value === "true");
        if (phone) setSalesPhone(phone.value || "");
      }

      const { data: logs } = await supabase
        .from("sms_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (logs) setSmsLogs(logs);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("sms-logs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "sms_logs" }, (payload) => {
        setSmsLogs((prev) => [payload.new as SmsLog, ...prev].slice(0, 20));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const saveSetting = async (key: string, value: string) => {
    const { data: existing } = await supabase.from("settings").select("id").eq("key", key).maybeSingle();
    if (existing) {
      await supabase.from("settings").update({ value }).eq("key", key);
    } else {
      await supabase.from("settings").insert({ key, value });
    }
  };

  const handleToggle = async (checked: boolean) => {
    setSmsEnabled(checked);
    await saveSetting("sms_alerts_enabled", String(checked));
    toast.success(checked ? "SMS alerts enabled" : "SMS alerts disabled");
  };

  const handleSavePhone = async () => {
    setSaving(true);
    await saveSetting("sales_rep_phone", salesPhone);
    setSaving(false);
    toast.success("Sales rep phone saved");
  };

  const handleTestSms = async () => {
    if (!salesPhone) {
      toast.error("Please enter a sales rep phone number first");
      return;
    }
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-sms", {
        body: { to: salesPhone, body: "🧪 TEST: HomeLead AI SMS alerts are working! This is a test message." },
      });
      if (error) throw error;
      if (data?.success) {
        toast.success("Test SMS sent successfully!");
      } else {
        toast.error("Failed to send test SMS");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to send test SMS");
    }
    setTesting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/leads")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Settings</h1>
            <p className="text-muted-foreground text-sm">Configure SMS alerts for hot leads</p>
          </div>
        </div>

        {/* SMS Alert Toggle */}
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium text-foreground">Hot Lead SMS Alerts</p>
                <p className="text-sm text-muted-foreground">Send SMS when a lead scores 70+</p>
              </div>
            </div>
            <Switch checked={smsEnabled} onCheckedChange={handleToggle} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Sales Rep Phone Number</label>
            <div className="flex gap-2">
              <Input
                placeholder="+15551234567"
                value={salesPhone}
                onChange={(e) => setSalesPhone(e.target.value)}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={handleSavePhone} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleTestSms} disabled={testing} variant="secondary">
              {testing ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Send className="h-4 w-4 mr-1" />}
              Send Test SMS
            </Button>
            <Badge variant="outline" className="text-xs">
              Twilio Connected
            </Badge>
          </div>
        </div>

        {/* SMS History */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3">SMS History</h3>
          {smsLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No SMS alerts sent yet.</p>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smsLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">{log.phone_sent_to}</TableCell>
                      <TableCell className="max-w-[200px] truncate text-xs">{log.content}</TableCell>
                      <TableCell>
                        {log.status === "sent" ? (
                          <Badge variant="default" className="text-xs gap-1">
                            <CheckCircle className="h-3 w-3" /> Sent
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <XCircle className="h-3 w-3" /> Failed
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
