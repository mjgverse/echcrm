import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/legal-disclaimers")({
  head: () => ({
    meta: [
      { title: `Legal Disclaimers — ${SITE.name}` },
      { name: "description", content: `Important legal disclaimers regarding ${SITE.name}'s services.` },
      { property: "og:title", content: `Legal Disclaimers — ${SITE.name}` },
      { property: "og:description", content: `Important legal disclaimers regarding ${SITE.name}'s services.` },
    ],
  }),
  component: LegalDisclaimersPage,
});

function LegalDisclaimersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-secondary/50">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Legal Disclaimers
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 px-4 py-16 text-sm leading-relaxed text-muted-foreground sm:px-6">
          <p>
            {SITE.name} provides services to individuals and to real estate, mortgage, legal,
            tax, and estate-planning professionals, and may, on request, refer clients to other
            independent, fee-based service providers. Nothing on this website or in the client
            portal constitutes legal, tax, or financial advice, and nothing here is a binding
            offer to purchase real estate.
          </p>
          <p>
            Real estate transactions carry inherent risk, and there is no guarantee that {SITE.name}
            or any related program will avoid losses or achieve any particular outcome; all real
            estate is subject to the potential loss of equity over time. {SITE.name} does not
            provide tax or legal advice. Prospective sellers, buyers, investors, and any other
            party should consult their own tax or legal advisor before making an investment,
            purchase, or sale decision.
          </p>
          <p>
            {SITE.name} is a private, independent company. We are not a government agency, and we
            are not associated with or approved by any government agency. We are not a Realtor®
            or a licensed real estate agent, and we are not associated with any real estate
            brokerage. We are not a lender or a licensed mortgage broker, and we do not loan
            money.
          </p>
          <p>
            Questions about these disclaimers can be sent to{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
              {SITE.contactEmail}
            </a>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
