import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const { user, role } = useAuth();
  const [full_name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles").select("*").eq("id", user.id).single();
      if (data) {
        setName(data.full_name ?? "");
        setCompany(data.company ?? "");
        setPhone(data.phone ?? "");
      }
      setLoading(false);
    })();
  }, [user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      email: user.email ?? "",
      full_name: full_name.trim() || null,
      company: company.trim() || null,
      phone: phone.trim() || null,
    });
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profile saved");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Update how you appear to coordinators and other participants.</p>
      </div>
      <Card className="p-6">
        <form onSubmit={save} className="grid gap-4">
          <div className="grid gap-2">
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
            <p className="text-xs text-muted-foreground">Role: <span className="font-medium uppercase">{role ?? "…"}</span></p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fn">Full name</Label>
            <Input id="fn" value={full_name} onChange={(e) => setName(e.target.value)} maxLength={100} disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="co">Company</Label>
            <Input id="co" value={company} onChange={(e) => setCompany(e.target.value)} maxLength={150} disabled={loading} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ph">Phone</Label>
            <Input id="ph" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={50} disabled={loading} />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving || loading}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
