import type { Metadata } from 'next'
import { LegalPage } from '@/components/LegalPage'

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms for creating and using a DukaanWhats account and storefront.',
}

const sections = [
  {
    title: '1. Using DukaanWhats',
    paragraphs: [
      'DukaanWhats provides tools for sellers to create public product storefronts and start customer order conversations on WhatsApp. By creating an account or using the service, you agree to these Terms and our Privacy Policy.',
      'You must provide accurate account information, keep your sign-in details secure and use the service only if you are legally able to agree to these Terms. You are responsible for activity carried out through your account.',
    ],
  },
  {
    title: '2. Seller stores and content',
    paragraphs: [
      'You keep responsibility for the products, prices, descriptions, images, contact details and other content you publish. You must have the rights and permissions needed to use that content, keep listings accurate and comply with applicable laws and platform rules.',
      'Do not use DukaanWhats to publish unlawful, deceptive, infringing, harmful or fraudulent content, or to interfere with the service or another user. We may restrict or remove content or accounts where reasonably necessary to protect users, comply with law or address abuse.',
    ],
  },
  {
    title: '3. Orders and third-party services',
    paragraphs: [
      'DukaanWhats is a storefront tool, not a marketplace or a party to a sale between a seller and a customer. Sellers are responsible for their products, customer communications, order acceptance, delivery, returns, refunds, taxes and fulfilment.',
      'When a customer continues an order through WhatsApp, that conversation is handled by WhatsApp and the seller, under their own terms and policies. DukaanWhats does not receive or process the customer’s direct payment to the seller through that conversation.',
    ],
  },
  {
    title: '4. Plans and payment requests',
    paragraphs: [
      'Available plans, features and prices are shown on the Pricing page and may change. A paid-plan request may require a transaction reference and manual review. Submitting a request does not activate a paid plan; activation follows verification and confirmation in the account.',
      'Do not submit payment credentials, PINs or passwords in a transaction-reference field. If you have a question about a plan request, contact hello@dukaanwhats.pk. Any refund or cancellation rights required by applicable law remain unaffected by these Terms.',
    ],
  },
  {
    title: '5. Availability, changes and account closure',
    paragraphs: [
      'We work to keep DukaanWhats useful and available, but we do not promise uninterrupted operation or that every feature will remain unchanged. We may update, suspend or discontinue parts of the service for maintenance, security, legal or operational reasons.',
      'You may stop using the service at any time. Contact us to request account closure or removal of account data. We may suspend or close access for serious or repeated violations, security risks or other reasons permitted by law.',
    ],
  },
  {
    title: '6. Disclaimers and responsibility',
    paragraphs: [
      'To the extent permitted by applicable law, DukaanWhats is provided on an “as available” basis. We are not responsible for a seller’s products, a customer’s purchase decision, a third-party service or a dispute between a seller and customer.',
      'Nothing in these Terms excludes a consumer right or other liability that cannot lawfully be excluded. Where liability may lawfully be limited, it is limited to the extent permitted by applicable law.',
    ],
  },
  {
    title: '7. Changes to these Terms',
    paragraphs: [
      'We may revise these Terms when the service or applicable requirements change. The latest version and effective date will be posted here. We will provide additional notice for material changes where required by law.',
    ],
  },
]

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" summary="These terms explain the basic rules for using DukaanWhats and the responsibilities of sellers who publish a storefront.">
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
