import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Save, Upload, Trash2, UserPlus, Image as ImageIcon, Bell, Users } from "lucide-react";
import { toast } from "sonner";

interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

export default function ClientSettings() {
  const { clientId, user } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    loadAll();
  }, [clientId]);

  const loadAll = async () => {
    const [settingsRes, teamRes] = await Promise.all([
      supabase.from("client_settings").select("*").eq("client_id", clientId!).maybeSingle(),
      supabase.from("user_roles").select("id, user_id, role").eq("client_id", clientId!),
    ]);

    const s = settingsRes.data || {
      business_name: "", business_address: "", business_phone: "",
      primary_color: "#3b82f6", secondary_color: "#64748b",
      notification_preferences: { sms_hot_leads: true, email_hot_leads: true },
      logo_url: null,
    };
    setSettings(s);
    setLogoUrl(s.logo_url || null);

    // Fetch emails for team members from profiles
    const members = teamRes.data || [];
    if (members.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", members.map((m) => m.user_id));

      const enriched = members.map((m) => ({
        ...m,
        email: profiles?.find((p) => p.user_id === m.user_id)?.full_name || m.user_id.slice(0, 8),
      }));
      setTeamMembers(enriched);
    } else {
      setTeamMembers([]);
    }

    setLoading(false);
  };

  const update = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }));

  const updateNotifPref = (key: string, value: boolean) => {
    setSettings((s: any) => ({
      ...s,
      notification_preferences: { ...(s.notification_preferences || {}), [key]: value },
    }));
  };

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
      logo_url: logoUrl,
      notification_preferences: settings.notification_preferences,
    }, { onConflict: "client_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${clientId}/logo.${ext}`;

    const { error } = await supabase.storage.from("client-logos").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Upload failed: " + error.message);
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("client-logos").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded");
  };

  const removeLogo = async () => {
    if (!clientId) return;
    // Remove from storage
    await supabase.storage.from("client-logos").remove([`${clientId}/logo.png`, `${clientId}/logo.jpg`, `${clientId}/logo.svg`, `${clientId}/logo.webp`]);
    setLogoUrl(null);
    toast.success("Logo removed");
  };

  const addTeamMember = async () => {
    if (!newMemberEmail || !clientId) return;
    setAddingMember(true);

    // Look up user by email in profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("full_name", newMemberEmail)
      .maybeSingle();

    if (!profile) {
      toast.error("User not found. They must sign up first, then you can add them.");
      setAddingMember(false);
      return;
    }

    const { error } = await supabase.from("user_roles").insert({
      user_id: profile.user_id,
      role: "client_viewer",
      client_id: clientId,
    });

    if (error) {
      if (error.code === "23505") toast.error("User already on the team");
      else toast.error(error.message);
    } else {
      toast.success("Team member added");
      setNewMemberEmail("");
      loadAll();
    }
    setAddingMember(false);
  };

  const removeMember = async (roleId: string, userId: string) => {
    if (userId === user?.id) {
      toast.error("You can't remove yourself");
      return;
    }
    await supabase.from("user_roles").delete().eq("id", roleId);
    setTeamMembers((prev) => prev.filter((m) => m.id !== roleId));
    toast.success("Team member removed");
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </ClientLayout>
    );
  }

  const notifPrefs = settings?.notification_preferences || {};

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <Tabs defaultValue="business">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Business Tab */}
          <TabsContent value="business" className="space-y-4 mt-4">
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
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Logo</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {logoUrl ? (
                  <div className="flex items-center gap-4">
                    <img src={logoUrl} alt="Business logo" className="h-16 w-16 object-contain rounded-lg border border-border" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Replace"}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={removeLogo}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-20 border-dashed">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Logo (max 2MB)
                  </Button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                <p className="text-xs text-muted-foreground">PNG, JPG, SVG or WebP. Shown in client-facing pages.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Brand Colors</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium text-foreground">Primary</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={settings?.primary_color || "#3b82f6"} onChange={(e) => update("primary_color", e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                      <Input value={settings?.primary_color || ""} onChange={(e) => update("primary_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium text-foreground">Secondary</label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={settings?.secondary_color || "#64748b"} onChange={(e) => update("secondary_color", e.target.value)} className="h-9 w-12 rounded border border-input cursor-pointer" />
                      <Input value={settings?.secondary_color || ""} onChange={(e) => update("secondary_color", e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="User's display name or email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addTeamMember} disabled={addingMember || !newMemberEmail} size="sm">
                    {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Team members must sign up first. Add them by their display name.</p>

                <Separator />

                {teamMembers.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No team members yet.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {teamMembers.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell className="text-sm">{member.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs capitalize">
                              {member.role.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {member.user_id !== user?.id && (
                              <Button variant="ghost" size="sm" onClick={() => removeMember(member.id, member.user_id)}>
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">SMS for Hot Leads</p>
                    <p className="text-xs text-muted-foreground">Receive SMS when a lead scores 70+</p>
                  </div>
                  <Switch
                    checked={notifPrefs.sms_hot_leads ?? true}
                    onCheckedChange={(v) => updateNotifPref("sms_hot_leads", v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Email for Hot Leads</p>
                    <p className="text-xs text-muted-foreground">Receive email notifications for hot leads</p>
                  </div>
                  <Switch
                    checked={notifPrefs.email_hot_leads ?? true}
                    onCheckedChange={(v) => updateNotifPref("email_hot_leads", v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">New Appointment Alerts</p>
                    <p className="text-xs text-muted-foreground">Get notified when appointments are booked</p>
                  </div>
                  <Switch
                    checked={notifPrefs.appointment_alerts ?? true}
                    onCheckedChange={(v) => updateNotifPref("appointment_alerts", v)}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Daily Summary Email</p>
                    <p className="text-xs text-muted-foreground">Receive a daily recap of leads and calls</p>
                  </div>
                  <Switch
                    checked={notifPrefs.daily_summary ?? false}
                    onCheckedChange={(v) => updateNotifPref("daily_summary", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save All Settings
        </Button>
      </div>
    </ClientLayout>
  );
}
