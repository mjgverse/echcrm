import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { CONCERN_OPTIONS, priorityForConcern, type FileConcern } from "@/lib/format";

export function NewFileDialog() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [concern, setConcern] = useState<FileConcern | "">("");
  const [saving, setSaving] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !concern) return;
    setSaving(true);
    const { data: file, error } = await supabase
      .from("files")
      .insert({
        customer_id: user.id,
        subject: subject.trim(),
        status: "open",
        concern,
        priority: priorityForConcern(concern),
      })
      .select()
      .single();
    if (error || !file) {
      setSaving(false);
      toast.error(error?.message || "Couldn't create file");
      return;
    }
    if (message.trim()) {
      await supabase.from("file_messages").insert({
        file_id: file.id,
        sender_id: user.id,
        message: message.trim(),
      });
    }
    setSaving(false);
    setOpen(false);
    setSubject("");
    setMessage("");
    setConcern("");
    toast.success("File created");
    qc.invalidateQueries({ queryKey: ["files"] });
    navigate({ to: "/portal/files/$fileId", params: { fileId: file.id } });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="mr-1 h-4 w-4" /> New file</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a new file</DialogTitle>
          <DialogDescription>
            One file per transaction. Everyone posts to the same thread.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. 123 Main St — Purchase Agreement"
              required
              maxLength={200}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="concern">Concern</Label>
            <Select value={concern} onValueChange={(v) => setConcern(v as FileConcern)}>
              <SelectTrigger id="concern"><SelectValue placeholder="Select a concern" /></SelectTrigger>
              <SelectContent>
                {CONCERN_OPTIONS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="msg">First message (optional)</Label>
            <Textarea
              id="msg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Give the coordinator the context they need."
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving || !subject.trim() || !concern}>
              {saving ? "Creating…" : "Create file"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}