import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Card } from "@/components/ui/card";
import { Loader2, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/team")({
  component: TeamPage,
});

type Profile = { id: string; full_name: string | null; email: string; company: string | null };

function TeamPage() {
  const { role } = useAuth();

  const { data: admins, isLoading } = useQuery({
    queryKey: ["team", "admins"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data: rr } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      const ids = (rr ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as Profile[];
      const { data } = await supabase.from("profiles").select("id, full_name, email, company").in("id", ids);
      return (data ?? []) as Profile[];
    },
  });

  const { data: customers } = useQuery({
    queryKey: ["team", "customers"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data: rr } = await supabase.from("user_roles").select("user_id").eq("role", "customer");
      const ids = (rr ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as Profile[];
      const { data } = await supabase.from("profiles").select("id, full_name, email, company").in("id", ids);
      return (data ?? []) as Profile[];
    },
  });

  if (role !== "admin") {
    return (
      <div className="mx-auto max-w-md text-center">
        <ShieldOff className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-muted-foreground">Admins only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-muted-foreground">Admins and customer accounts.</p>
      </div>

      <section>
        <h2 className="font-serif text-lg font-semibold">Admins</h2>
        {isLoading ? (
          <div className="mt-3 flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {(admins ?? []).map((a) => (
              <Card key={a.id} className="p-4">
                <div className="font-medium">{a.full_name || a.email}</div>
                <div className="text-sm text-muted-foreground">{a.email}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-serif text-lg font-semibold">Customers</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {(customers ?? []).map((a) => (
            <Card key={a.id} className="p-4">
              <div className="font-medium">{a.full_name || a.email}</div>
              <div className="text-sm text-muted-foreground">{a.email}{a.company ? ` · ${a.company}` : ""}</div>
            </Card>
          ))}
          {(customers ?? []).length === 0 && (
            <div className="text-sm text-muted-foreground">No customers yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}
