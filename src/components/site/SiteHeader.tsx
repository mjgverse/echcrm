import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { Menu, LayoutDashboard, UserRound, LogOut, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  const handleLogout = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center">
          <img src="/logo-full.png" alt={SITE.name} className="h-10 w-auto" />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-sm text-foreground/80 hover:text-foreground">
            Home
          </Link>
          <Link to="/contact" className="text-sm text-foreground/80 hover:text-foreground">
            Contact
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm text-foreground/80 hover:text-foreground focus:outline-none">
                {displayName}
                <ChevronDown className="h-3.5 w-3.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/portal">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/portal/profile">
                    <UserRound className="mr-2 h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" className="text-sm text-foreground/80 hover:text-foreground">
              Sign in
            </Link>
          )}
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
            {user ? (
              <>
                <div className="pt-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {displayName}
                </div>
                <Link to="/portal" onClick={() => setOpen(false)} className="py-2 text-sm">
                  Dashboard
                </Link>
                <Link to="/portal/profile" onClick={() => setOpen(false)} className="py-2 text-sm">
                  Profile
                </Link>
                <button onClick={handleLogout} className="py-2 text-left text-sm text-destructive">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setOpen(false)} className="py-2 text-sm">
                Sign in
              </Link>
            )}
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
