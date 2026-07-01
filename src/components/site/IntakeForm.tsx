import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  phone: z.string().trim().max(50).optional().or(z.literal("")),
  company: z.string().trim().max(150).optional().or(z.literal("")),
  message: z.string().trim().min(1, "Tell us how we can help").max(2000),
});

export function IntakeForm() {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors({});
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      name: fd.get("name"),
      email: fd.get("email"),
      phone: fd.get("phone") || "",
      company: fd.get("company") || "",
      message: fd.get("message"),
    });
    if (!parsed.success) {
      const fe: Record<string, string> = {};
      for (const iss of parsed.error.issues) fe[String(iss.path[0])] = iss.message;
      setErrors(fe);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("inquiries").insert({
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      message: parsed.data.message,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't send your inquiry. Please try again.");
      return;
    }
    setDone(true);
    toast.success("We got it — someone will follow up shortly.");
  }

  if (done) {
    return (
      <div className="rounded-xl border bg-card p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-primary" />
        <h3 className="mt-4 font-serif text-2xl font-semibold">Thanks — we got it.</h3>
        <p className="mt-2 text-muted-foreground">
          Someone from our team will follow up shortly, usually within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" required maxLength={100} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required maxLength={255} />
          {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input id="phone" name="phone" type="tel" maxLength={50} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company">Company / Brokerage (optional)</Label>
        <Input id="company" name="company" maxLength={150} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">How can we help?</Label>
        <Textarea id="message" name="message" rows={5} required maxLength={2000} />
        {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
      </div>
      <Button type="submit" size="lg" disabled={submitting}>
        {submitting ? "Sending…" : "Get Started"}
      </Button>
      <p className="text-xs text-muted-foreground">
        By submitting, you agree to be contacted about your inquiry. No spam.
      </p>
    </form>
  );
}
