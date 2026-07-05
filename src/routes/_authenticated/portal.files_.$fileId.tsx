import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime, relativeTime, STATUS_LABEL, PRIORITY_LABEL, CONCERN_OPTIONS, priorityForConcern, type FilePriority, type FileStatus, type FileConcern } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/portal/Badges";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/portal/files_/$fileId")({
  component: FileDetail,
});

type FileRow = {
  id: string;
  subject: string;
  status: FileStatus;
  priority: FilePriority;
  concern: FileConcern;
  customer_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  file_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type Profile = { id: string; full_name: string | null; email: string; company: string | null };

function FileDetail() {
  const { fileId } = Route.useParams();
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const qc = useQueryClient();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const fileQuery = useQuery({
    queryKey: ["files", fileId],
    queryFn: async () => {
      const { data, error } = await supabase.from("files").select("*").eq("id", fileId).single();
      if (error) throw error;
      return data as FileRow;
    },
  });

  const msgsQuery = useQuery({
    queryKey: ["file_messages", fileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("file_messages")
        .select("*")
        .eq("file_id", fileId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Message[];
    },
  });

  const participantIds = new Set<string>();
  if (fileQuery.data) {
    participantIds.add(fileQuery.data.customer_id);
    if (fileQuery.data.assigned_to) participantIds.add(fileQuery.data.assigned_to);
  }
  (msgsQuery.data ?? []).forEach((m) => participantIds.add(m.sender_id));

  const profilesQuery = useQuery({
    queryKey: ["profiles", Array.from(participantIds).sort().join(",")],
    enabled: participantIds.size > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, company")
        .in("id", Array.from(participantIds));
      if (error) throw error;
      return data as Profile[];
    },
  });

  const admins = useQuery({
    queryKey: ["admins"],
    enabled: isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id").eq("role", "admin");
      if (error) throw error;
      const ids = (data ?? []).map((r) => r.user_id);
      if (ids.length === 0) return [] as Profile[];
      const { data: p, error: e2 } = await supabase
        .from("profiles").select("id, full_name, email, company").in("id", ids);
      if (e2) throw e2;
      return p as Profile[];
    },
  });

  // Realtime updates for the thread
  useEffect(() => {
    const channel = supabase
      .channel(`file-${fileId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "file_messages", filter: `file_id=eq.${fileId}` }, () => {
        qc.invalidateQueries({ queryKey: ["file_messages", fileId] });
        qc.invalidateQueries({ queryKey: ["files", fileId] });
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "files", filter: `id=eq.${fileId}` }, () => {
        qc.invalidateQueries({ queryKey: ["files", fileId] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fileId, qc]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgsQuery.data?.length]);

  const [reply, setReply] = useState("");
  const [posting, setPosting] = useState(false);

  async function postReply() {
    if (!reply.trim() || !user) return;
    setPosting(true);
    const text = reply.trim();
    const { error } = await supabase.from("file_messages").insert({
      file_id: fileId,
      sender_id: user.id,
      message: text,
    });
    if (error) {
      setPosting(false);
      toast.error(error.message);
      return;
    }

    // Customer reply reopens a closed/new file. Admin reply on an open file moves it to In Progress.
    if (fileQuery.data?.status === "new_inquiry" || fileQuery.data?.status === "closed") {
      await supabase.from("files").update({ status: "open" }).eq("id", fileId);
    } else if (isAdmin && fileQuery.data?.status === "open") {
      await supabase.from("files").update({ status: "in_progress" }).eq("id", fileId);
    }
    setReply("");
    setPosting(false);
    qc.invalidateQueries({ queryKey: ["file_messages", fileId] });
    qc.invalidateQueries({ queryKey: ["files", fileId] });
    qc.invalidateQueries({ queryKey: ["files"] });
  }

  async function closeCase() {
    if (reply.trim()) {
      await postReply();
    }
    await updateField({ status: "closed" });
  }

  async function updateField(patch: Partial<Pick<FileRow, "status" | "priority" | "assigned_to" | "concern">>) {
    const { error } = await supabase.from("files").update(patch).eq("id", fileId);
    if (error) return toast.error(error.message);
    if (patch.assigned_to !== undefined && user) {
      await supabase.from("file_assignments").insert({
        file_id: fileId,
        admin_id: patch.assigned_to,
        assigned_by: user.id,
      });
    }
    toast.success("Updated");
    qc.invalidateQueries({ queryKey: ["files", fileId] });
    qc.invalidateQueries({ queryKey: ["files"] });
  }

  if (fileQuery.isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }
  if (fileQuery.error || !fileQuery.data) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/portal/files" })}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Back
        </Button>
        <p className="text-destructive">File not found or you don't have access.</p>
      </div>
    );
  }

  const f = fileQuery.data;
  const profilesById = new Map((profilesQuery.data ?? []).map((p) => [p.id, p]));
  const customer = profilesById.get(f.customer_id);
  const assignee = f.assigned_to ? profilesById.get(f.assigned_to) : null;

  const canEditMeta = isAdmin;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div>
          <Link to="/portal/files" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> All files
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={f.priority} />
            <StatusBadge status={f.status} />
            <span className="rounded-full border px-2 py-0.5 text-xs text-muted-foreground">
              {f.concern}
            </span>
            <span className="ml-auto text-xs text-muted-foreground">
              updated {relativeTime(f.updated_at)}
            </span>
          </div>
          <h1 className="mt-3 font-serif text-2xl font-semibold tracking-tight">{f.subject}</h1>
          <div className="mt-2 text-sm text-muted-foreground">
            Opened by {customer?.full_name || customer?.email || "customer"} · {formatDateTime(f.created_at)}
          </div>
        </div>

        <div className="rounded-xl border bg-card">
          <div className="border-b p-4 font-serif font-semibold">Thread</div>
          <div ref={scrollRef} className="max-h-[500px] space-y-4 overflow-y-auto p-4">
            {msgsQuery.isLoading ? (
              <div className="text-muted-foreground">Loading messages…</div>
            ) : (msgsQuery.data ?? []).length === 0 ? (
              <div className="text-muted-foreground">No messages yet. Start the conversation below.</div>
            ) : (
              (msgsQuery.data ?? []).map((m) => {
                const sender = profilesById.get(m.sender_id);
                const isSelf = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-lg border p-3 ${isSelf ? "bg-primary/10 border-primary/30" : "bg-accent/40"}`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">
                          {sender?.full_name || sender?.email || "Unknown"}
                        </span>
                        <span>·</span>
                        <span>{formatDateTime(m.created_at)}</span>
                      </div>
                      <div className="mt-1 whitespace-pre-wrap text-sm">{m.message}</div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {f.status === "closed" ? (
            <div className="border-t p-4 text-sm text-muted-foreground">
              This file is closed. No further replies can be posted — the history above is still visible.
            </div>
          ) : (
            <div className="border-t p-4">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Post a reply to this file…"
                rows={3}
                maxLength={5000}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") postReply();
                }}
              />
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>Cmd/Ctrl+Enter to send</span>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" disabled={posting}>
                          Close case
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Close this case?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This marks the file as closed and notifies the customer. No further replies can be posted after closing.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>No</AlertDialogCancel>
                          <AlertDialogAction onClick={closeCase}>Yes, close case</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                  <Button size="sm" onClick={postReply} disabled={posting || !reply.trim()}>
                    <Send className="mr-1 h-4 w-4" />
                    {posting ? "Posting…" : "Post reply"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="space-y-4">
        <Card className="p-4">
          <h3 className="font-serif font-semibold">Details</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Customer</dt>
              <dd>{customer?.full_name || customer?.email || "—"}</dd>
              {customer?.company && <dd className="text-muted-foreground">{customer.company}</dd>}
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">Assigned to</dt>
              <dd>{assignee ? (assignee.full_name || assignee.email) : <span className="text-muted-foreground">Unassigned</span>}</dd>
            </div>
          </dl>
        </Card>

        {canEditMeta && (
          <Card className="space-y-4 p-4">
            <h3 className="font-serif font-semibold">Manage</h3>
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select value={f.status} onValueChange={(v) => updateField({ status: v as FileStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["new_inquiry", "open", "in_progress", "closed"] as FileStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Concern</Label>
              <Select
                value={f.concern}
                onValueChange={(v) =>
                  updateField({ concern: v as FileConcern, priority: priorityForConcern(v as FileConcern) })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONCERN_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={f.priority} onValueChange={(v) => updateField({ priority: v as FilePriority })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["low", "medium", "high", "urgent"] as FilePriority[]).map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_LABEL[p]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Assign to</Label>
              <Select
                value={f.assigned_to ?? "unassigned"}
                onValueChange={(v) => updateField({ assigned_to: v === "unassigned" ? null : v })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {(admins.data ?? []).map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Card>
        )}
      </aside>
    </div>
  );
}