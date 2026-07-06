import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScheduleButton } from "@/components/site/ScheduleButton";
import { Button } from "@/components/ui/button";
import { SITE } from "@/lib/site-config";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  ClipboardCheck,
  Users,
  Home as HomeIcon,
  Briefcase,
  Scale,
  KeyRound,
  ShieldCheck,
  Sparkles,
  Clock,
  LayoutDashboard,
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
  id,
  eyebrow,
  title,
  body,
  icon: Icon,
  reversed,
  bg,
  image,
  imageAlt,
}: {
  id?: string;
  eyebrow: string;
  title: string;
  body: string;
  icon: React.ComponentType<{ className?: string }>;
  reversed?: boolean;
  bg?: "warm" | "plain";
  image: string;
  imageAlt: string;
}) {
  return (
    <section id={id} className={`scroll-mt-16 ${bg === "warm" ? "bg-secondary/60" : ""}`}>
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
          <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-muted">
            <img src={image} alt={imageAlt} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Landing() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-secondary/70 to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 md:grid-cols-[1.1fr_1fr] md:py-28">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs uppercase tracking-wider text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> Independent Trustee Services
            </div>
            <h1 className="mt-4 font-serif text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
              Real protection for every party in the deal.
              <span className="block text-primary">Not just paperwork.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Equity Holding Corp is a professional, independent trustee. Through our Consumer
              Protection Trust™, we hold and safeguard property title so buyers, sellers, and
              investors can transact with confidence — start to finish.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {user ? (
                <Button
                  asChild
                  size="lg"
                  className="bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
                >
                  <Link to="/portal">
                    <LayoutDashboard className="mr-1 h-4 w-4" />
                    View Dashboard
                  </Link>
                </Button>
              ) : (
                <Button
                  asChild
                  size="lg"
                  className="shadow-lg shadow-primary/30"
                >
                  <Link to="/auth">
                    Get Started <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <ScheduleButton variant="outline" />
            </div>
            <div className="mt-10 grid grid-cols-3 gap-6 border-t pt-6 text-sm">
              <div>
                <div className="font-serif text-2xl font-semibold">25+</div>
                <div className="text-muted-foreground">years as a trustee</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold">3,000+</div>
                <div className="text-muted-foreground">properties held in trust</div>
              </div>
              <div>
                <div className="font-serif text-2xl font-semibold">Flat fee</div>
                <div className="text-muted-foreground">no hidden costs</div>
              </div>
            </div>
          </div>
          <div>
            <div className="aspect-[4/5] w-full overflow-hidden rounded-2xl border shadow-lg">
              <img
                src="/images/hero.jpg"
                alt="Equity Holding Corp trustee reviewing documents with clients"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <AudienceSection
        id="sellers"
        eyebrow="For Homeowners & Sellers"
        title="Protect the asset you've worked hardest for."
        body="Our Consumer Protection Trust™ holds your property's title securely through the life of a sale — keeping your equity and your privacy protected until every condition of the transfer is actually met."
        icon={HomeIcon}
        image="/images/sellers.jpg"
        imageAlt="Homeowner discussing a sale with an Equity Holding Corp representative"
      />
      <AudienceSection
        id="buyers"
        bg="warm"
        reversed
        eyebrow="For Home Buyers"
        title="Ownership with real safeguards, not just a signature."
        body="When you buy through a title-holding trust, an independent trustee — never a friend, a relative, or the other party to the deal — holds title until your agreement is fully satisfied."
        icon={KeyRound}
        image="/images/buyers.jpg"
        imageAlt="Home buyer touring a property with an Equity Holding Corp representative"
      />
      <AudienceSection
        id="investors"
        eyebrow="For Investors"
        title="Build a track record, not just a portfolio."
        body="Serious investors use our trust structure to keep every transaction transparent and above board, protecting sellers, buyers, and their own reputation on every deal they close."
        icon={Briefcase}
        image="/images/investors.jpg"
        imageAlt="Real estate investors reviewing a trust agreement"
      />
      <AudienceSection
        id="professionals"
        bg="warm"
        reversed
        eyebrow="For Real Estate & Legal Professionals"
        title="A trustee you can put your name behind."
        body="We're an independent, professional trustee for the Consumer Protection Trust™ — structured around the Garn-St. Germain Act and Dodd-Frank, so you can recommend us to clients with confidence."
        icon={Scale}
        image="/images/professionals.jpg"
        imageAlt="Real estate and legal professionals in a meeting with an Equity Holding Corp trustee"
      />

      {/* Why we're different */}
      <section className="bg-background">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              Why we're different
            </h2>
            <p className="mt-3 text-muted-foreground">
              Not every trust — or every trustee — actually protects you. Ours is built to.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: ShieldCheck,
                title: "Truly independent",
                body: "We're a neutral third party — never a friend, relative, or business partner of either side — so the trust actually holds up when it matters.",
              },
              {
                icon: ClipboardCheck,
                title: "Attorney-reviewed documents",
                body: "Every trust agreement and disclosure is prepared and reviewed by legal counsel, not assembled from a generic template.",
              },
              {
                icon: Sparkles,
                title: "Flat, transparent pricing",
                body: "One trustee fee, paid annually. No hidden costs and no surprises buried in the fine print.",
              },
              {
                icon: Scale,
                title: "Built for compliance",
                body: "Our structure is designed around the Garn-St. Germain Act and Dodd-Frank, protecting every party from due-on-sale exposure.",
              },
              {
                icon: Clock,
                title: "25 years, proven in practice",
                body: "Our trust structure has stood up to real-world scrutiny for decades — tested, not theoretical.",
              },
              {
                icon: Users,
                title: "Real people, real accountability",
                body: "You work directly with our team — a bonded, licensed, and insured trustee, not a call center or a bot.",
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
            Ready for real protection on your next transfer?
          </h2>
          <p className="max-w-xl text-primary-foreground/90">
            Book a 15-minute consultation and we'll walk you through exactly how our trust
            structure protects your property, your equity, and your peace of mind.
          </p>
          <ScheduleButton variant="outline" className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary" />
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
