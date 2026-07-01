import type { Database } from "@/integrations/supabase/types";

export type FileStatus = Database["public"]["Enums"]["file_status"];
export type FilePriority = Database["public"]["Enums"]["file_priority"];

export const STATUS_LABEL: Record<FileStatus, string> = {
  new_inquiry: "New Inquiry",
  open: "Open",
  in_progress: "In Progress",
  closed: "Closed",
};

export const PRIORITY_LABEL: Record<FilePriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const PRIORITY_RANK: Record<FilePriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
