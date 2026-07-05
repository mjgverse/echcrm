import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SITE } from "@/lib/site-config";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: `Privacy Policy — ${SITE.name}` },
      { name: "description", content: `How ${SITE.name} collects, uses, and protects your information.` },
      { property: "og:title", content: `Privacy Policy — ${SITE.name}` },
      { property: "og:description", content: `How ${SITE.name} collects, uses, and protects your information.` },
    ],
  }),
  component: PrivacyPage,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="font-serif text-xl font-semibold tracking-tight">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </div>
  );
}

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b bg-secondary/50">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
            <h1 className="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated: {new Date().getFullYear()}</p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-10 px-4 py-16 sm:px-6">
          <Section title="Overview">
            <p>
              This Privacy Policy explains how {SITE.name} ("we," "us," or "our") collects, uses,
              and safeguards information when you visit our website, submit an inquiry, or use
              our client portal (collectively, the "Services"). It does not apply to information
              collected by third parties, including any external site you may reach through a
              link on our Services.
            </p>
          </Section>

          <Section title="Information we collect">
            <p>
              We collect information you provide directly, such as your name, email address,
              phone number, company, and any message or file details you submit through our
              contact form, intake form, or client portal. When you create a portal account, we
              also store your login credentials (managed securely through our authentication
              provider), profile details, and the transaction files and messages you post while
              using the portal.
            </p>
            <p>
              We also automatically collect limited technical information when you visit our
              website or portal, such as browser type, device information, and general usage
              patterns, to help us maintain and improve the Services.
            </p>
          </Section>

          <Section title="How we use your information">
            <p>
              We use the information we collect to operate the client portal, respond to
              inquiries, coordinate transactions, send account and file-activity notifications,
              and communicate with you about our services. If you submit an inquiry through our
              website, we may follow up by email or phone to discuss your situation.
            </p>
            <p>
              You can opt out of non-essential email communications at any time using the
              unsubscribe link included in our messages, or by contacting us directly. Portal
              account notifications tied to your active files (such as new messages or status
              updates) are part of the core service and can be managed from within your account.
            </p>
          </Section>

          <Section title="Cookies and similar technologies">
            <p>
              Our website and portal use cookies and comparable browser storage to keep you
              signed in, remember preferences, and understand how the Services are used. Most
              browsers let you block or delete cookies, though doing so may affect your ability
              to sign in or use certain portal features.
            </p>
          </Section>

          <Section title="SMS communications">
            <p>
              If you opt in to receive text messages from us, message and data rates may apply,
              and messages may be sent using automated technology. You can stop SMS messages at
              any time by replying STOP to any message we send. Opting in to SMS also permits
              your wireless carrier to disclose limited account and device information to us
              solely for identity verification and fraud prevention.
            </p>
          </Section>

          <Section title="How we share information">
            <p>
              We do not sell your personal information. We may share information with service
              providers who help us operate the Services (such as hosting, authentication, and
              communication tools), with your consent, or when required to comply with the law,
              enforce our agreements, or protect the rights, property, or safety of {SITE.name}
              or others.
            </p>
            <p>
              Within the client portal, information you post to a shared file — such as messages
              and status updates — is visible to the other participants on that file (for
              example, the assigned coordinator and the customer who owns the file), consistent
              with the purpose of the portal.
            </p>
          </Section>

          <Section title="Data security">
            <p>
              We use reasonable administrative and technical safeguards to protect the
              information in our care, including encrypted transmission and access controls on
              portal data. No method of transmission or storage is completely secure, however,
              and we cannot guarantee absolute security. You're responsible for keeping your
              account credentials confidential.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Our Services are not directed to children under 13, and we do not knowingly collect
              personal information from them. If you believe a child has provided us with
              personal information, please contact us so we can remove it.
            </p>
          </Section>

          <Section title="California privacy rights">
            <p>
              California residents may contact us to request that we limit or discontinue our use
              of their personal information, as permitted by applicable law.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              We may update this Privacy Policy from time to time. Changes take effect as soon as
              we post the revised version on this page, so we encourage you to review it
              periodically.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this Privacy Policy can be sent to{" "}
              <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
                {SITE.contactEmail}
              </a>{" "}
              or by phone at {SITE.phone}.
            </p>
          </Section>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
