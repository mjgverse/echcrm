import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { ScheduleButton } from "@/components/site/ScheduleButton";
import { SITE } from "@/lib/site-config";
import { ShieldCheck, ClipboardCheck, Sparkles, Scale, Clock, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: `About Us — ${SITE.name}` },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `About Us — ${SITE.name}` },
      { property: "og:description", content: SITE.description },
    ],
  }),
  component: AboutPage,
});

const values = [
  {
    icon: ShieldCheck,
    title: "Truly independent",
    body: "We act as a neutral third party — never a friend, relative, or business partner of either side — so the trust holds up when it actually matters.",
  },
  {
    icon: ClipboardCheck,
    title: "Attorney-reviewed documents",
    body: "Every trust agreement, deed, and disclosure we prepare is reviewed by legal counsel before it ever reaches a client — never assembled from a generic template.",
  },
  {
    icon: Scale,
    title: "Built for compliance",
    body: "Our structure is designed around the Garn-St. Germain Act and Dodd-Frank, keeping every party clear of due-on-sale exposure.",
  },
  {
    icon: Clock,
    title: "Decades of practice",
    body: "Our trust structure has been tested in real transactions and real courts for decades, not just written up in theory.",
  },
  {
    icon: Users,
    title: "A dedicated team, not a call center",
    body: "You work directly with our team — a bonded, licensed, and insured trustee, not a rotating call center or an automated bot.",
  },
  {
    icon: Sparkles,
    title: "Flat, transparent pricing",
    body: "One trustee fee, paid annually. No hidden costs and nothing buried in the fine print.",
  },
];

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-secondary/50">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              About {SITE.name}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">{SITE.description}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
          <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
            An independent trustee, built to actually protect you
          </h2>
          <p className="mt-4 text-muted-foreground">
            Real estate trusts have a long history of legitimate use — but not every trust, and
            not every trustee, is built the same way. Some so-called title-holding trusts are
            thin, unreviewed paperwork that leave sellers, buyers, and investors exposed the
            moment they're actually tested. Ours isn't one of them.
          </p>
          <p className="mt-4 text-muted-foreground">
            {SITE.name} was founded to give every party in a seller-financed real estate transfer
            — the homeowner, the buyer, the investor, and the professionals advising them — a
            structure they can actually rely on. Our proprietary Consumer Protection Trust™ has
            been refined and tested for decades, and we act strictly as an independent, licensed
            trustee: never a party to the deal, and never beholden to one side of it.
          </p>
          <p className="mt-4 text-muted-foreground">
            We're not a law firm, a lender, a real estate brokerage, or a government agency — we
            hold and safeguard title as a neutral, bonded, and insured third party, so the people
            on both sides of a transaction can move forward with confidence.
          </p>
        </section>

        <section className="border-t bg-secondary/40">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              What makes our trust structure different
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {values.map((v) => (
                <div key={v.title} className="rounded-xl border bg-card p-6 shadow-sm">
                  <div className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <v.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-6">
            <h2 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
              Want to see if a title-holding trust is right for your transaction?
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Book a short consultation and we'll walk you through exactly how our structure
              protects everyone involved.
            </p>
            <ScheduleButton />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
