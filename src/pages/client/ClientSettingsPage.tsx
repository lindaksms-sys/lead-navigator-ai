import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function ClientSettings() {
  const { clientId } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase.from("client_settings").select("*").eq("client_id", clientId).maybeSingle();
      setSettings(data || {
        business_name: "", business_address: "", business_phone: "",
        primary_color: "#3b82f6", secondary_color: "#64748b",
      });
      setLoading(false);
    };
    fetch();
  }, [clientId]);

  const handleSave = async () => {
    if (!clientId) return;
    setSaving(true);
    const { error } = await supabase.from("client_settings").upsert({
      client_id: clientId,
      business_name: settings.business_name,
      business_address: settings.business_address,
      business_phone: settings.business_phone,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
    }, { onConflict: "client_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const update = (key: string, value: string) => setSettings((s: any) => ({ ...s, [key]: value }));

  if (loading) return <ClientLayout><div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div></ClientLayout>;

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <Card>
          <CardHeader><CardTitle className="text-sm">Business Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Business Name</label>
              <Input value={settings?.business_name || ""} onChange={(e) => update("business_name", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Address</label>
              <Input value={settings?.business_address || ""} onChange={(e) => update("business_address", e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input value={settings?.business_phone || ""} onChange={(e) => update("business_phone", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-foreground">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings?.primary_color || "#3b82f6"} onChange={(e) => update("primary_color", e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                  <Input value={settings?.primary_color || ""} onChange={(e) => update("primary_color", e.target.value)} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium text-foreground">Secondary Color</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={settings?.secondary_color || "#64748b"} onChange={(e) => update("secondary_color", e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                  <Input value={settings?.secondary_color || ""} onChange={(e) => update("secondary_color", e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>
    </ClientLayout>
  );
}
