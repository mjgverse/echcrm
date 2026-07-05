import { Link } from "@tanstack/react-router";
import { Facebook, Linkedin, Mail, Phone, Youtube } from "lucide-react";
import { SITE } from "@/lib/site-config";
import { useAuth } from "@/lib/auth-context";

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-serif text-sm font-semibold tracking-wide text-foreground">
      {children}
    </h3>
  );
}

function FooterLink(props: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
    />
  );
}

export function SiteFooter() {
  const { user } = useAuth();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60 bg-secondary/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Company */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground font-serif text-lg font-bold">
                E
              </span>
              <span className="font-serif text-lg font-semibold tracking-tight text-foreground">
                {SITE.name}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {SITE.description}
            </p>
            <div className="mt-6">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Follow us on our Social Channels
              </p>
              <div className="mt-3 flex items-center gap-3">
                <a
                  href={SITE.facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Equity Holding Corp on Facebook"
                  className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Facebook className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </a>
                <a
                  href={SITE.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Equity Holding Corp on LinkedIn"
                  className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Linkedin className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </a>
                <a
                  href={SITE.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Equity Holding Corp on YouTube"
                  className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Youtube className="h-4 w-4" fill="currentColor" strokeWidth={0} />
                </a>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <FooterHeading>Navigation</FooterHeading>
            <nav className="mt-4 flex flex-col gap-3">
              <FooterLink to="/">Home</FooterLink>
              {user ? (
                <FooterLink to="/portal">Dashboard</FooterLink>
              ) : (
                <FooterLink to="/auth">Get Started</FooterLink>
              )}
              <FooterLink to="/contact">Contact</FooterLink>
            </nav>
          </div>

          {/* Services */}
          <div>
            <FooterHeading>Who We Serve</FooterHeading>
            <nav className="mt-4 flex flex-col gap-3">
              <FooterLink to="/" hash="sellers">For Sellers</FooterLink>
              <FooterLink to="/" hash="buyers">For Buyers</FooterLink>
              <FooterLink to="/" hash="investors">For Investors</FooterLink>
            </nav>
          </div>

          {/* Company / Legal */}
          <div>
            <FooterHeading>Company</FooterHeading>
            <nav className="mt-4 flex flex-col gap-3">
              <FooterLink to="/about">About Us</FooterLink>
              <FooterLink to="/privacy">Privacy Policy</FooterLink>
              <FooterLink to="/legal-disclaimers">Legal Disclaimers</FooterLink>
            </nav>
          </div>
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {SITE.name}. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <a
              href={`mailto:${SITE.contactEmail}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Mail className="h-3.5 w-3.5" /> {SITE.contactEmail}
            </a>
            <a
              href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <Phone className="h-3.5 w-3.5" /> {SITE.phone}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
