import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScheduleButton } from "@/components/site/ScheduleButton";
import { SITE } from "@/lib/site-config";
import {
  ArrowRight,
  ClipboardCheck,
  Users,
  Home as HomeIcon,
  Briefcase,
  Scale,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Clock,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: `${SITE.name} — ${SITE.tagline}` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} — ${SITE.tagline}` },
      { property: "og:description", content: SITE.description },
    ],
  }),
  component: Landing,
});

function AudienceSection({
  eyebrow,
  title,
  body,
  icon: Icon,
  reversed,
  bg,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  reversed?: boolean;
  bg?: "warm" | "plain";
}) {
  return (
    <section className={bg === "warm" ? "bg-secondary/60" : ""}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:gap-16 md:py-24">
        <div className={reversed ? "md:order-2" : ""}>
          <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            {eyebrow}
          </div>
          <h2 className="mt-4 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">{body}</p>
          <div className="mt-6">
            <ScheduleButton />
          </div>
        </div>
        <div className={reversed ? "md:order-1" : ""}>
          <div
            className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted"
            data-image-placeholder
          >
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              image_{Math.floor(Math.random() * 100)}.jpg
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/70 to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Flat-fee transaction coordination
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Every deal in one place.
              <span className="block text-primary">No more CC chains.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              We coordinate your real estate transactions from contract to close — one file, one
              owner, one clear status. So nothing slips.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ScheduleButton />
              <Link
                to="/contact"
                className="inline-flex items-center gap-1 rounded-md px-4 py-2 text-sm font-medium text-foreground hover:text-primary"
              >
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6 text-sm">
              <div>
                <div className="font-serif text-2xl font-semibold">25+</div>
                <div className="text-muted-foreground">years in real estate</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold">3,000+</div>
                <div className="text-muted-foreground">transactions handled</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold">Flat-fee</div>
                <div className="text-muted-foreground">no per-email surprises</div>
              </div>
            </div>
          </div>
          <div>
            <div
              className="aspect-[4/5] w-full overflow-hidden rounded-2xl border shadow-lg"
              data-image-placeholder
            >
              <div className="flex h-full w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                image_hero.jpg
              </div>
            </div>
          </div>
        </div>
      </section>

      <AudienceSection
        eyebrow="For Real Estate Agents"
        title="Focus on selling. We'll handle the paperwork."
        body="From executed contract through closing, we manage every deadline, disclosure, and signature — so you can stay in front of clients instead of drowning in email."
        icon={Briefcase}
      />
      <AudienceSection
        bg="warm"
        reversed
        eyebrow="For Brokerages"
        title="Consistent transactions across every agent."
        body="Give your team a single coordinator workflow. Every file follows the same checklist, tracked in one portal — no more guessing who's chasing what."
        icon={Users}
      />
      <AudienceSection
        eyebrow="For Investors"
        title="Move faster on high-volume deals."
        body="Whether you're closing one or fifty, our flat-fee coordination scales with you. You'll always know exactly where a file stands — no digging through inboxes."
        icon={HomeIcon}
      />
      <AudienceSection
        bg="warm"
        reversed
        eyebrow="For Legal & Escrow"
        title="A single thread per file. Full audit trail."
        body="Every document, every message, every status change lives on the file. Reply in the portal and every party sees it — no orphaned CC chains."
        icon={Scale}
      />

      {/* Why we're different */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Why we're different
            </h2>
            <p className="mt-3 text-muted-foreground">
              Most coordination happens in email. That's exactly the problem.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: MessageSquare,
                title: "One thread per file",
                body: "Every agent, coordinator, and party posts to the same running conversation. No CC-all replies, no missed forwards.",
              },
              {
                icon: ShieldCheck,
                title: "Clear ownership",
                body: "Each file has one assigned coordinator. You always know whose job it is — and so do they.",
              },
              {
                icon: Clock,
                title: "Priority you can see",
                body: "Urgent files are color-coded. Anything about to slip is visible at a glance — not buried in an inbox.",
              },
              {
                icon: ClipboardCheck,
                title: "Full audit trail",
                body: "Every status change, every assignment, every message is timestamped and stored on the file.",
              },
              {
                icon: Sparkles,
                title: "Flat, predictable pricing",
                body: "One fee per file. Not per email, not per phone call. What you see is what you pay.",
              },
              {
                icon: Users,
                title: "Real humans, no bots",
                body: "You're working with experienced coordinators — not an AI, not an offshore chat window.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-xl border bg-card p-6 shadow-sm">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <c.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold">{c.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex justify-center">
            <ScheduleButton />
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="border-y bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to stop chasing email chains?
          </h2>
          <p className="max-w-xl text-primary-foreground/90">
            Book a 15-minute consultation. We'll walk you through how a file flows from contract to
            close in our portal.
          </p>
          <ScheduleButton variant="outline" className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
