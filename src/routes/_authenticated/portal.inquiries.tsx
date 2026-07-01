import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2, ArrowRight, ShieldOff } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/inquiries")({
  component: InquiriesPage,
});

type Inquiry = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string;
  created_at: string;
  converted_to_file_id: string | null;
};

function InquiriesPage() {
  const { role, user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["inquiries"],
    enabled: role === "admin",
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquiries")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Inquiry[];
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

  async function convertToFile(inq: Inquiry) {
    if (!user) return;
    // Create a placeholder file owned by the admin, so the inquiry is trackable.
    // (Customer accounts are created when they sign up separately.)
    const { data: file, error } = await supabase
      .from("files")
      .insert({
        customer_id: user.id,
        subject: `${inq.name} — ${inq.message.slice(0, 60)}${inq.message.length > 60 ? "…" : ""}`,
        status: "new_inquiry",
        priority: "medium",
        assigned_to: user.id,
      })
      .select()
      .single();
    if (error || !file) return toast.error(error?.message || "Couldn't create file");
    await supabase.from("file_messages").insert({
      file_id: file.id,
      sender_id: user.id,
      message:
        `Inquiry from ${inq.name} <${inq.email}>` +
        (inq.phone ? ` · ${inq.phone}` : "") +
        (inq.company ? ` · ${inq.company}` : "") +
        `\n\n${inq.message}`,
    });
    await supabase.from("inquiries").update({ converted_to_file_id: file.id }).eq("id", inq.id);
    toast.success("Inquiry converted to file");
    qc.invalidateQueries({ queryKey: ["inquiries"] });
    qc.invalidateQueries({ queryKey: ["files"] });
    navigate({ to: "/portal/files/$fileId", params: { fileId: file.id } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Inquiries</h1>
        <p className="text-sm text-muted-foreground">Public form submissions. Convert to a file to track.</p>
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>
      ) : (data ?? []).length === 0 ? (
        <Card className="p-10 text-center text-muted-foreground">No inquiries yet.</Card>
      ) : (
        <div className="grid gap-4">
          {(data ?? []).map((inq) => (
            <Card key={inq.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-serif text-lg font-semibold">{inq.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {inq.email}{inq.phone ? ` · ${inq.phone}` : ""}{inq.company ? ` · ${inq.company}` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDateTime(inq.created_at)}</div>
                </div>
                {inq.converted_to_file_id ? (
                  <Button variant="outline" size="sm" onClick={() => navigate({ to: "/portal/files/$fileId", params: { fileId: inq.converted_to_file_id! } })}>
                    Open file <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => convertToFile(inq)}>Convert to file</Button>
                )}
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm">{inq.message}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
