import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { Menu } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const displayName = profileQuery.data?.full_name?.split(" ")[0] || profileQuery.data?.email || "Account";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-serif text-lg font-bold">
            E
          </span>
          <span className="font-serif text-lg font-semibold tracking-tight">{SITE.name}</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm text-foreground/80 hover:text-foreground">
            Home
          </Link>
          <Link to="/contact" className="text-sm text-foreground/80 hover:text-foreground">
            Contact
          </Link>
          <Link to={user ? "/portal" : "/auth"} className="text-sm text-foreground/80 hover:text-foreground">
            {user ? displayName : "Sign in"}
          </Link>
          <Button asChild size="lg">
            <a href={SITE.calendlyUrl} target="_blank" rel="noreferrer">
              Schedule a Consultation
            </a>
          </Button>
        </nav>

        <button
          className="rounded-md p-2 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
            <Link to="/" onClick={() => setOpen(false)} className="py-2 text-sm">
              Home
            </Link>
            <Link to="/contact" onClick={() => setOpen(false)} className="py-2 text-sm">
              Contact
            </Link>
            <Link to={user ? "/portal" : "/auth"} onClick={() => setOpen(false)} className="py-2 text-sm">
              {user ? displayName : "Sign in"}
            </Link>
            <Button asChild className="mt-2">
              <a href={SITE.calendlyUrl} target="_blank" rel="noreferrer">
                Schedule a Consultation
              </a>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}