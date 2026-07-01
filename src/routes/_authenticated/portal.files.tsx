import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PRIORITY_RANK, relativeTime, STATUS_LABEL, type FilePriority, type FileStatus } from "@/lib/format";
import { StatusBadge, PriorityBadge } from "@/components/portal/Badges";
import { NewFileDialog } from "@/components/portal/NewFileDialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/portal/files")({
  component: FilesList,
});

type FileRow = {
  id: string;
  subject: string;
  status: FileStatus;
  priority: FilePriority;
  customer_id: string;
  assigned_to: string | null;
  updated_at: string;
};

type Filter = "open_all" | "assigned_to_me" | "in_progress" | "closed" | "all";

function FilesList() {
  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const [filter, setFilter] = useState<Filter>("open_all");
  const [q, setQ] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["files", "list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return data as FileRow[];
    },
    enabled: !!user,
  });

  const filtered = useMemo(() => {
    const list = data ?? [];
    let f = list;
    switch (filter) {
      case "open_all": f = list.filter((r) => r.status !== "closed"); break;
      case "assigned_to_me": f = list.filter((r) => r.assigned_to === user?.id); break;
      case "in_progress": f = list.filter((r) => r.status === "in_progress"); break;
      case "closed": f = list.filter((r) => r.status === "closed"); break;
      case "all": break;
    }
    if (q.trim()) {
      const s = q.toLowerCase();
      f = f.filter((r) => r.subject.toLowerCase().includes(s));
    }
    return [...f].sort((a, b) => {
      const rp = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (rp !== 0) return rp;
      return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
    });
  }, [data, filter, q, user?.id]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Files</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? "All files across all customers." : "Your transaction files."}
          </p>
        </div>
        <NewFileDialog />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="open_all">Open</TabsTrigger>
            {isAdmin && <TabsTrigger value="assigned_to_me">Assigned to me</TabsTrigger>}
            <TabsTrigger value="in_progress">In progress</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search subject…" className="pl-8" />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        {isLoading ? (
          <div className="flex items-center gap-2 p-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground">No files match your filter.</div>
        ) : (
          <ul className="divide-y">
            {filtered.map((f) => (
              <li key={f.id}>
                <Link
                  to="/portal/files/$fileId"
                  params={{ fileId: f.id }}
                  className="flex items-center justify-between gap-4 p-4 transition hover:bg-accent/40"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
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
