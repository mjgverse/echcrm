import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PRIORITY_RANK, relativeTime, STATUS_LABEL, type FilePriority, type FileStatus } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/portal/Badges";
import { NewFileDialog } from "@/components/portal/NewFileDialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Inbox } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/")({
  component: PortalOverview,
});

type FileRow = {
  id: string;
  subject: string;
  status: FileStatus;
  priority: FilePriority;
  customer_id: string;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
};

function PortalOverview() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";

  const { data: files, isLoading } = useQuery({
    queryKey: ["files", "overview", isAdmin, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data as FileRow[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading…</div>;
  }

  const list = files ?? [];
  const open = list.filter((f) => f.status !== "closed");
  const closed = list.filter((f) => f.status === "closed");
  const sorted = [...open].sort((a, b) => {
    const rp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (rp !== 0) return rp;
    return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
  });

  const counts: Record<FileStatus, number> = {
    new_inquiry: list.filter((f) => f.status === "new_inquiry").length,
    open: list.filter((f) => f.status === "open").length,
    in_progress: list.filter((f) => f.status === "in_progress").length,
    closed: closed.length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">
            {isAdmin ? "All files" : "Your files"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin
              ? "Priority-sorted view — what needs attention first."
              : "Post updates and see status/priority at a glance."}
          </p>
        </div>
        <NewFileDialog />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(Object.keys(counts) as FileStatus[]).map((s) => (
          <Card key={s}>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {STATUS_LABEL[s]}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-serif text-3xl font-semibold">{counts[s]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-serif text-lg font-semibold">Needs attention</h2>
          <Link to="/portal/files" className="text-sm text-primary hover:underline">
            View all files →
          </Link>
        </div>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
            <Inbox className="h-8 w-8" />
            <p>No open files. You're all clear.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {sorted.slice(0, 10).map((f) => (
              <li key={f.id}>
                <Link
                  to="/portal/files/$fileId"
                  params={{ fileId: f.id }}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <PriorityBadge priority={f.priority} />
                      <StatusBadge status={f.status} />
                    </div>
                    <div className="mt-1 truncate font-medium">{f.subject}</div>
                  </div>
                  <div className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                    updated {relativeTime(f.updated_at)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
