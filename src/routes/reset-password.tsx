import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: `Set a new password — ${SITE.name}` },
      { name: "description", content: "Choose a new password for your account." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Supabase JS auto-processes the recovery token from the URL hash and
    // fires PASSWORD_RECOVERY. We just need a valid session to update.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (session && event === "SIGNED_IN")) {
        setReady(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
      else {
        // No hash + no session → invalid entry
        setTimeout(() => {
          if (!window.location.hash.includes("access_token")) {
            setError("This reset link is invalid or has expired. Request a new one.");
          }
        }, 500);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password"));
    const confirm = String(fd.get("confirm"));
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) toast.error(err.message);
    else {
      toast.success("Password updated. Redirecting…");
      navigate({ to: "/portal", replace: true });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <h1 className="font-serif text-3xl font-semibold tracking-tight">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a strong password of at least 8 characters.
        </p>

        {error ? (
          <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 p-4 text-sm">
            {error}
            <div className="mt-3">
              <Link to="/forgot-password" className="text-primary underline underline-offset-2">
                Request a new link
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">New password</Label>
              <Input id="password" name="password" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input id="confirm" name="confirm" type="password" minLength={8} required autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={loading || !ready}>
              {loading ? "Updating…" : ready ? "Update password" : "Verifying link…"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
