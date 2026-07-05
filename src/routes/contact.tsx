import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { IntakeForm } from "@/components/site/IntakeForm";
import { ScheduleButton } from "@/components/site/ScheduleButton";
import { SITE } from "@/lib/site-config";
import { Mail, Phone, Calendar } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: `Contact — ${SITE.name}` },
      { name: "description", content: `Tell us about your situation. We'll follow up within one business day.` },
      { property: "og:title", content: `Contact — ${SITE.name}` },
      { property: "og:description", content: `Tell us about your situation. We'll follow up within one business day.` },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-secondary/50">
          <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Get in touch
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              New to us? Send a quick note about your situation — we'll follow up within one
              business day. Already a client? Sign in to your portal to keep everything on file.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr]">
          <IntakeForm />

          <aside className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-xl font-semibold">Prefer to talk?</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Book a free 15-minute call and we'll walk through your workflow.
              </p>
              <div className="mt-4">
                <ScheduleButton />
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <h3 className="font-serif text-xl font-semibold">Reach us directly</h3>
              <ul className="mt-3 space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" /> {SITE.phone}
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" /> {SITE.contactEmail}
                </li>
                <li className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" /> Mon–Fri, 9am–6pm
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}