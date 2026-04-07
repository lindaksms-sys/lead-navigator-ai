import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ClientLayout } from "@/components/client/ClientLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2, Save, Upload, Trash2, UserPlus, Image as ImageIcon,
  Bell, Users, Clock, MapPin, Plug, Copy, Check, Calendar, Phone, MessageSquare
} from "lucide-react";
import { toast } from "sonner";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_LABELS: Record<string, string> = {
  monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu",
  friday: "Fri", saturday: "Sat", sunday: "Sun"
};
const DEFAULT_HOURS = { open: "08:00", close: "17:00", closed: false };

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
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!clientId) { setLoading(false); return; }
    loadAll();
  }, [clientId]);

  const loadAll = async () => {
    const [settingsRes, teamRes, activityRes] = await Promise.all([
      supabase.from("client_settings").select("*").eq("client_id", clientId!).maybeSingle(),
      supabase.from("user_roles").select("id, user_id, role").eq("client_id", clientId!),
      supabase.from("client_activity_log").select("*").eq("client_id", clientId!).order("created_at", { ascending: false }).limit(20),
    ]);

    const defaultBusinessHours: Record<string, any> = {};
    DAYS.forEach((d) => (defaultBusinessHours[d] = { ...DEFAULT_HOURS }));

    const s = settingsRes.data || {
      business_name: "", business_address: "", business_phone: "",
      primary_color: "#3b82f6", secondary_color: "#64748b",
      notification_preferences: { sms_hot_leads: true, email_hot_leads: true },
      logo_url: null, business_hours: defaultBusinessHours,
      service_zip_codes: [], service_address: "", service_radius_miles: 25,
      quiet_hours_start: "22:00", quiet_hours_end: "07:00", quiet_hours_days: [],
      escalation_timeout_minutes: 15, escalation_manager_phone: "",
    };

    if (!s.business_hours || Object.keys(s.business_hours).length === 0) {
      s.business_hours = defaultBusinessHours;
    }

    setSettings(s);
    setLogoUrl(s.logo_url || null);
    setActivityLog(activityRes.data || []);

    const members = teamRes.data || [];
    if (members.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles").select("user_id, full_name")
        .in("user_id", members.map((m) => m.user_id));
      setTeamMembers(members.map((m) => ({
        ...m,
        email: profiles?.find((p) => p.user_id === m.user_id)?.full_name || m.user_id.slice(0, 8),
      })));
    } else {
      setTeamMembers([]);
    }
    setLoading(false);
  };

  const update = (key: string, value: any) => setSettings((s: any) => ({ ...s, [key]: value }));
  const updateNotifPref = (key: string, value: boolean) => {
    setSettings((s: any) => ({
      ...s, notification_preferences: { ...(s.notification_preferences || {}), [key]: value },
    }));
  };
  const updateBusinessHour = (day: string, field: string, value: any) => {
    setSettings((s: any) => ({
      ...s, business_hours: { ...s.business_hours, [day]: { ...s.business_hours[day], [field]: value } },
    }));
  };
  const copyHoursToAll = (sourceDay: string) => {
    const source = settings.business_hours[sourceDay];
    setSettings((s: any) => {
      const hours = { ...s.business_hours };
      DAYS.forEach((d) => (hours[d] = { ...source }));
      return { ...s, business_hours: hours };
    });
    toast.success("Hours copied to all days");
  };

  const handleSave = async () => {
    if (!clientId) return;
    setSaving(true);
    const payload: any = {
      client_id: clientId,
      business_name: settings.business_name,
      business_address: settings.business_address,
      business_phone: settings.business_phone,
      primary_color: settings.primary_color,
      secondary_color: settings.secondary_color,
      logo_url: logoUrl,
      notification_preferences: settings.notification_preferences,
      business_hours: settings.business_hours,
      service_zip_codes: settings.service_zip_codes,
      service_address: settings.service_address,
      service_radius_miles: settings.service_radius_miles,
      quiet_hours_start: settings.quiet_hours_start,
      quiet_hours_end: settings.quiet_hours_end,
      quiet_hours_days: settings.quiet_hours_days,
      escalation_timeout_minutes: settings.escalation_timeout_minutes,
      escalation_manager_phone: settings.escalation_manager_phone,
    };
    const { error } = await supabase.from("client_settings").upsert(payload, { onConflict: "client_id" });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Settings saved");
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clientId) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${clientId}/logo.${ext}`;
    const { error } = await supabase.storage.from("client-logos").upload(path, file, { upsert: true });
    if (error) { toast.error("Upload failed: " + error.message); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from("client-logos").getPublicUrl(path);
    setLogoUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Logo uploaded");
  };

  const removeLogo = async () => {
    if (!clientId) return;
    await supabase.storage.from("client-logos").remove([`${clientId}/logo.png`, `${clientId}/logo.jpg`, `${clientId}/logo.svg`, `${clientId}/logo.webp`]);
    setLogoUrl(null);
    toast.success("Logo removed");
  };

  const addTeamMember = async () => {
    if (!newMemberEmail || !clientId) return;
    setAddingMember(true);
    const { data: profile } = await supabase
      .from("profiles").select("user_id").eq("full_name", newMemberEmail).maybeSingle();
    if (!profile) { toast.error("User not found. They must sign up first."); setAddingMember(false); return; }
    const { error } = await supabase.from("user_roles").insert({ user_id: profile.user_id, role: "client_viewer", client_id: clientId });
    if (error) {
      if (error.code === "23505") toast.error("User already on the team");
      else toast.error(error.message);
    } else { toast.success("Team member added"); setNewMemberEmail(""); loadAll(); }
    setAddingMember(false);
  };

  const updateMemberRole = async (roleId: string, newRole: string) => {
    const { error } = await supabase.from("user_roles").update({ role: newRole as any }).eq("id", roleId);
    if (error) toast.error(error.message);
    else { toast.success("Role updated"); loadAll(); }
  };

  const removeMember = async (roleId: string, userId: string) => {
    if (userId === user?.id) { toast.error("You can't remove yourself"); return; }
    await supabase.from("user_roles").delete().eq("id", roleId);
    setTeamMembers((prev) => prev.filter((m) => m.id !== roleId));
    toast.success("Team member removed");
  };

  if (loading) {
    return (
      <ClientLayout>
        <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </ClientLayout>
    );
  }

  const notifPrefs = settings?.notification_preferences || {};
  const businessHours = settings?.business_hours || {};
  const quietDays = settings?.quiet_hours_days || [];

  return (
    <ClientLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>

        <Tabs defaultValue="business">
          <TabsList className="flex flex-wrap h-auto gap-1">
            <TabsTrigger value="business" className="text-xs">Business</TabsTrigger>
            <TabsTrigger value="hours" className="text-xs">Hours</TabsTrigger>
            <TabsTrigger value="service-area" className="text-xs">Service Area</TabsTrigger>
            <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
            <TabsTrigger value="integrations" className="text-xs">Integrations</TabsTrigger>
          </TabsList>

          {/* ===== Business Tab ===== */}
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
                      <Button variant="ghost" size="sm" onClick={removeLogo}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full h-20 border-dashed">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    Upload Logo (max 2MB)
                  </Button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
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

          {/* ===== Business Hours Tab ===== */}
          <TabsContent value="hours" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Business Hours</CardTitle>
                <CardDescription>Set your operating hours for each day of the week.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DAYS.map((day) => {
                  const h = businessHours[day] || DEFAULT_HOURS;
                  return (
                    <div key={day} className="flex items-center gap-2 sm:gap-4">
                      <div className="w-10 text-sm font-medium text-foreground">{DAY_LABELS[day]}</div>
                      <Switch checked={!h.closed} onCheckedChange={(v) => updateBusinessHour(day, "closed", !v)} />
                      {h.closed ? (
                        <span className="text-sm text-muted-foreground">Closed</span>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <Input type="time" value={h.open} onChange={(e) => updateBusinessHour(day, "open", e.target.value)} className="w-[120px] text-sm" />
                          <span className="text-muted-foreground text-sm">to</span>
                          <Input type="time" value={h.close} onChange={(e) => updateBusinessHour(day, "close", e.target.value)} className="w-[120px] text-sm" />
                        </div>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => copyHoursToAll(day)} title="Copy to all days">
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Service Area Tab ===== */}
          <TabsContent value="service-area" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> Service Area</CardTitle>
                <CardDescription>Define the geographic area you serve.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Address</label>
                  <Input
                    placeholder="123 Main St, City, State"
                    value={settings?.service_address || ""}
                    onChange={(e) => update("service_address", e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">Service Radius</label>
                    <span className="text-sm font-bold text-foreground">{settings?.service_radius_miles || 25} miles</span>
                  </div>
                  <Slider
                    value={[settings?.service_radius_miles || 25]}
                    onValueChange={([v]) => update("service_radius_miles", v)}
                    min={5} max={50} step={5}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>5 mi</span><span>25 mi</span><span>50 mi</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Zip Codes (optional override)</label>
                  <Textarea
                    placeholder="Enter zip codes separated by commas: 90210, 90211, 90212..."
                    value={(settings?.service_zip_codes || []).join(", ")}
                    onChange={(e) => update("service_zip_codes", e.target.value.split(",").map((z: string) => z.trim()).filter(Boolean))}
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">If set, zip codes override the radius-based area.</p>
                </div>
                {/* Static map placeholder */}
                <div className="rounded-lg border border-border bg-muted/50 h-40 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Map preview</p>
                    <p className="text-xs">{settings?.service_address ? `${settings.service_radius_miles || 25} mile radius from ${settings.service_address}` : "Enter an address to see coverage"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Team Tab ===== */}
          <TabsContent value="team" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Users className="h-4 w-4" /> Team Members</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input placeholder="User's display name" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} className="flex-1" />
                  <Button onClick={addTeamMember} disabled={addingMember || !newMemberEmail} size="sm">
                    {addingMember ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 mr-1" />}
                    Add
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Team members must sign up first.</p>
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
                            <Select
                              value={member.role}
                              onValueChange={(v) => updateMemberRole(member.id, v)}
                              disabled={member.user_id === user?.id}
                            >
                              <SelectTrigger className="h-8 w-[130px]"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client_admin">Admin</SelectItem>
                                <SelectItem value="client_viewer">Viewer</SelectItem>
                              </SelectContent>
                            </Select>
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

            {activityLog.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-sm">Recent Activity</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {activityLog.map((a) => (
                      <div key={a.id} className="flex items-start gap-2 text-sm">
                        <span className="text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-foreground">{a.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* ===== Notifications Tab ===== */}
          <TabsContent value="notifications" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Bell className="h-4 w-4" /> Alert Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "sms_hot_leads", label: "SMS for Hot Leads", desc: "Receive SMS when a lead scores 70+", def: true },
                  { key: "email_hot_leads", label: "Email for Hot Leads", desc: "Receive email notifications for hot leads", def: true },
                  { key: "appointment_alerts", label: "New Appointment Alerts", desc: "Get notified when appointments are booked", def: true },
                  { key: "daily_summary", label: "Daily Summary Email", desc: "Receive a daily recap of leads and calls", def: false },
                ].map((item, i) => (
                  <div key={item.key}>
                    {i > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch checked={notifPrefs[item.key] ?? item.def} onCheckedChange={(v) => updateNotifPref(item.key, v)} />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4" /> Quiet Hours</CardTitle>
                <CardDescription>No SMS alerts during these hours.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium text-foreground">Start</label>
                    <Input type="time" value={settings?.quiet_hours_start || "22:00"} onChange={(e) => update("quiet_hours_start", e.target.value)} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium text-foreground">End</label>
                    <Input type="time" value={settings?.quiet_hours_end || "07:00"} onChange={(e) => update("quiet_hours_end", e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Active Days</label>
                  <div className="flex flex-wrap gap-3">
                    {DAYS.map((day) => (
                      <label key={day} className="flex items-center gap-1.5 text-sm">
                        <Checkbox
                          checked={quietDays.includes(day)}
                          onCheckedChange={(checked) => {
                            update("quiet_hours_days",
                              checked ? [...quietDays, day] : quietDays.filter((d: string) => d !== day)
                            );
                          }}
                        />
                        {DAY_LABELS[day]}
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Escalation Rules</CardTitle>
                <CardDescription>Auto-escalate unclaimed hot leads to a manager.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Timeout (minutes)</label>
                  <p className="text-xs text-muted-foreground">If hot lead not claimed within this time, alert manager.</p>
                  <Input
                    type="number" min={1} max={120}
                    value={settings?.escalation_timeout_minutes || 15}
                    onChange={(e) => update("escalation_timeout_minutes", parseInt(e.target.value) || 15)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Manager Phone</label>
                  <Input
                    placeholder="+1 555-123-4567"
                    value={settings?.escalation_manager_phone || ""}
                    onChange={(e) => update("escalation_manager_phone", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== Integrations Tab ===== */}
          <TabsContent value="integrations" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Plug className="h-4 w-4" /> Connected Services</CardTitle>
                <CardDescription>View the status of your platform integrations.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Calendly", desc: "Appointment scheduling", icon: Calendar, connected: true },
                  { name: "Twilio SMS", desc: "SMS notifications", icon: MessageSquare, connected: true },
                  { name: "Voice AI (Vapi)", desc: "AI receptionist calls", icon: Phone, connected: true },
                  { name: "HubSpot CRM", desc: "CRM sync", icon: Users, connected: false },
                  { name: "Salesforce", desc: "CRM sync", icon: Users, connected: false },
                ].map((integration, i) => (
                  <div key={integration.name}>
                    {i > 0 && <Separator />}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${integration.connected ? "bg-green-50 text-green-600" : "bg-muted text-muted-foreground"}`}>
                          <integration.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{integration.name}</p>
                          <p className="text-xs text-muted-foreground">{integration.desc}</p>
                        </div>
                      </div>
                      <Badge variant={integration.connected ? "default" : "secondary"} className={integration.connected ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}>
                        {integration.connected ? (
                          <><Check className="h-3 w-3 mr-1" /> Connected</>
                        ) : "Not Connected"}
                      </Badge>
                    </div>
                  </div>
                ))}
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
