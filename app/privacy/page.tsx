import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Learn what information DukaanWhats collects, how it is used, and the choices available to you.',
}

const sections = [
  {
    title: '1. Information we handle',
    paragraphs: [
      'When you create an account, we handle your email address and account details. If you build a store, we store the business and contact details, products, images, theme settings and other content you choose to add.',
      'When you submit a paid-plan request, we may store the plan and billing period you selected, the transaction reference you provide, and the status and review notes needed to process that request. DukaanWhats does not ask you to enter card or wallet passwords.',
      'For storefront analytics, we record events such as store views, product views, add-to-cart actions and WhatsApp clicks. The event record can include the relevant store or product, time, IP address, browser user-agent and referring page.',
    ],
  },
  {
    title: '2. How we use information',
    paragraphs: [
      'We use this information to create and operate accounts and storefronts, display seller-provided products, provide analytics, review plan requests, respond to support questions, protect the service and meet applicable legal obligations.',
      'We do not use storefront information to sell advertising profiles. We may use aggregated or de-identified service data to understand usage and improve DukaanWhats.',
    ],
  },
  {
    title: '3. Storefronts and WhatsApp',
    paragraphs: [
      'A seller’s public storefront and the information they choose to publish can be viewed by anyone with the store link. Sellers should not publish private or sensitive information in public product listings.',
      'When a customer chooses to order on WhatsApp, their browser opens WhatsApp with an order message for the seller. The customer then communicates with the seller through WhatsApp, which is operated under its own privacy terms. DukaanWhats does not process that conversation or the seller’s direct customer payment.',
    ],
  },
  {
    title: '4. Service providers and disclosures',
    paragraphs: [
      'We use service providers to host the application and operate authentication, database and file-storage features. Information may be processed by those providers to deliver the service. We limit access to account and payment-review information to people who need it to operate DukaanWhats.',
      'The optional site-wide help assistant sends the current conversation to our server. If generative AI is enabled, our server sends those messages to Google Gemini or OpenAI, depending on the configured provider, to produce a response; otherwise, built-in FAQ answers are used. DukaanWhats does not save chat history to its database. Avoid entering passwords, one-time codes, payment credentials or private customer information. The selected AI provider processes requests under its own service terms.',
      'We may disclose information where required by law, to address security or abuse, or to protect the rights and safety of users and the service. We do not sell personal information.',
    ],
  },
  {
    title: '5. Security and retention',
    paragraphs: [
      'We use access controls and reasonable technical measures intended to protect information. No online service can promise absolute security. Please keep your password private and contact us if you believe an account has been accessed without permission.',
      'We retain account and store information while it is needed to provide the service and for legitimate operational or legal needs. You can ask us about access, correction or deletion by emailing hello@dukaanwhats.pk. Some records may need to be retained where the law requires it or to resolve a dispute.',
    ],
  },
  {
    title: '6. Essential storage and your choices',
    paragraphs: [
      'DukaanWhats and its authentication provider use browser storage or similar essential technologies to keep you signed in and remember account state. You can control or clear browser storage in your browser settings; doing so may sign you out or affect site functionality.',
      'You can choose what information to add to a store, and you can contact us about your account information. If you use a public store, the seller is responsible for the products and contact details they publish.',
    ],
  },
  {
    title: '7. Changes to this policy',
    paragraphs: [
      'We may update this policy as DukaanWhats changes. We will post the revised version on this page and update its effective date. Continued use after an update means the updated policy applies to future use of the service.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" summary="This policy explains how DukaanWhats handles information when you use our website, create a store or browse a seller’s storefront." effectiveDate="November 8, 2026">
      {sections.map(({ title, paragraphs }) => (
        <section key={title} className="py-6 first:pt-0 last:pb-0">
          <h2 className="text-lg font-bold tracking-tight">{title}</h2>
          <div className="mt-3 space-y-3 text-sm leading-7 text-zinc-600">
            {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </section>
      ))}
    </LegalPage>
  )
}
