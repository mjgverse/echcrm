import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { SITE } from "@/lib/site-config";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: `Sign in — ${SITE.name}` },
      { name: "description", content: `Sign in to your ${SITE.name} portal.` },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: "/portal", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-secondary/70 md:flex md:flex-col md:justify-between md:p-10">
        <Link to="/" className="flex items-center">
          <img src="/logo-full.png" alt={SITE.name} className="h-10 w-auto" />
        </Link>
        <div className="max-w-md">
          <h2 className="font-serif text-3xl font-semibold tracking-tight">
            Every deal, one file, one owner.
          </h2>
          <p className="mt-3 text-muted-foreground">
            Your portal replaces the CC chain. Post to a file, see status and priority at a glance,
            get notified only when something needs your attention.
          </p>
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {SITE.name}</p>
      </div>

      <div className="flex flex-col items-center justify-center p-6 sm:p-10">
        <Link to="/" className="mb-6 flex items-center gap-1 self-start text-sm text-muted-foreground hover:text-foreground md:hidden">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <div className="w-full max-w-md">
          <h1 className="font-serif text-3xl font-semibold tracking-tight">Welcome</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in or create an account to access your portal.</p>

          <Tabs defaultValue="signin" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create account</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="mt-4">
              <SignInForm />
            </TabsContent>
            <TabsContent value="signup" className="mt-4">
              <SignUpForm />
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-4 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            <span>or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton />

          <p className="mt-6 text-xs text-muted-foreground">
            By continuing you agree to our terms. This portal is for coordinated transactions —
            replies to notification emails aren't monitored; use the portal for the conversation.
          </p>
        </div>
      </div>
    </div>
  );
}

function SignInForm() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Signed in.");
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email-in">Email</Label>
        <Input id="email-in" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="pw-in">Password</Label>
          <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <Input id="pw-in" name="password" type="password" required autoComplete="current-password" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
    </form>
  );
}

function SignUpForm() {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: String(fd.get("email")),
      password: String(fd.get("password")),
      options: {
        emailRedirectTo: `${window.location.origin}/portal`,
        data: {
          full_name: String(fd.get("full_name") || ""),
          company: String(fd.get("company") || ""),
        },
      },
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("Account created — welcome!");
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name-up">Full name</Label>
        <Input id="name-up" name="full_name" required maxLength={100} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="company-up">Company / Brokerage (optional)</Label>
        <Input id="company-up" name="company" maxLength={150} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email-up">Email</Label>
        <Input id="email-up" name="email" type="email" required autoComplete="email" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="pw-up">Password</Label>
        <Input id="pw-up" name="password" type="password" minLength={8} required autoComplete="new-password" />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
    </form>
  );
}

function GoogleButton() {
  const [loading, setLoading] = useState(false);
  async function onClick() {
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setLoading(false);
      toast.error(result.error.message || "Google sign-in failed");
      return;
    }
    if (result.redirected) return; // browser redirecting
    // Session set, refresh page state
    setLoading(false);
    toast.success("Signed in with Google");
  }
  return (
    <Button variant="outline" className="w-full" onClick={onClick} disabled={loading}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.3-1.7 3.8-5.5 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.4 14.6 2.5 12 2.5 6.8 2.5 2.5 6.7 2.5 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-8.4 0-.6-.1-1-.2-1.4H12z"/>
      </svg>
      {loading ? "Connecting…" : "Continue with Google"}
    </Button>
  );
}
