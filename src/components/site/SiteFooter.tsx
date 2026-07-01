import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site-config";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60 bg-secondary/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground font-serif font-bold">
            E
          </span>
          <div>
            <div className="font-serif font-semibold text-foreground">{SITE.name}</div>
            <div>© {year}. All rights reserved.</div>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link to="/contact" className="hover:text-foreground">Contact</Link>
          <a href="#" className="hover:text-foreground">Privacy</a>
          <a href="#" className="hover:text-foreground">Legal</a>
          <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`} className="hover:text-foreground">{SITE.phone}</a>
        </nav>
      </div>
    </footer>
  );
}
