import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_LABEL, STATUS_LABEL, type FilePriority, type FileStatus } from "@/lib/format";

export function StatusBadge({ status }: { status: FileStatus }) {
  const map: Record<FileStatus, string> = {
    new_inquiry: "bg-info/15 text-info border-info/30",
    open: "bg-warning/15 text-warning border-warning/30",
    in_progress: "bg-primary/15 text-primary border-primary/30",
    closed: "bg-muted text-muted-foreground border-border",
  };
  return (
    <Badge variant="outline" className={cn("font-medium", map[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function PriorityBadge({ priority }: { priority: FilePriority }) {
  const map: Record<FilePriority, string> = {
    urgent: "bg-destructive text-destructive-foreground border-destructive",
    high: "bg-primary/90 text-primary-foreground border-primary",
    medium: "bg-warning/20 text-foreground border-warning/40",
    low: "bg-muted text-muted-foreground border-border",
  };
  const dot: Record<FilePriority, string> = {
    urgent: "bg-destructive-foreground",
    high: "bg-primary-foreground",
    medium: "bg-warning",
    low: "bg-muted-foreground",
  };
  return (
    <Badge className={cn("gap-1.5 font-medium", map[priority])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dot[priority])} />
      {PRIORITY_LABEL[priority]}
    </Badge>
  );
}
