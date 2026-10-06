import { siteConfig } from "@/data/home";

export type TermsPart = string | { text: string; href: string };

export type TermsSection = {
  id: string;
  title: string;
  paragraphs: readonly (readonly TermsPart[])[];
};

export const termsContent = {
  title: "Terms & Conditions",
  description: `Terms and conditions for using ${siteConfig.url.replace("https://", "")} and buying food products from ${siteConfig.legalName}.`,
  updatedLabel: "Last updated: 3 October 2026",
  intro: `These Terms & Conditions ("Terms") are a contract between you and ${siteConfig.legalName} ("we", "us", "our") for use of ${siteConfig.url.replace("https://", "")} and for orders of namkeens, mithai, bakery, gajak, hampers, and related food products. Please read them with our Privacy Policy and Shipping & Returns policy. If you do not agree, do not use the website or place an order.`,
  sections: [
    {
      id: "acceptance",
      title: "1. Introduction and acceptance",
      paragraphs: [
        [
          `${siteConfig.legalName} has prepared and sold vegetarian savouries and sweets since ${siteConfig.founded}. These Terms apply to browsing, creating an account, and buying from the website. They are published for customers in India and for anyone else who accesses the website.`,
        ],
        [
          `By accessing the website, creating an account, ticking the acceptance box at sign-in or registration, or placing an order, you confirm that you have read these Terms and agree to be bound by them. If you place an order for someone else, you confirm that you are authorised to do so and that they will be made aware of these Terms where it affects them.`,
        ],
        [
          `Additional terms may apply to a particular offer, coupon, or corporate or catering enquiry. If those terms conflict with these Terms on that subject, the additional terms apply to that offer or enquiry only.`,
        ],
      ],
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      paragraphs: [
        [
          `You must be at least 18 years old to create an account and to place an order. If you are under 18, you may use the website only with the involvement and consent of a parent or legal guardian, who accepts these Terms and is responsible for the activity and the order.`,
        ],
        [
          `You confirm that you are competent to contract under the Indian Contract Act, 1872, or that a parent or legal guardian is contracting on your behalf. We may refuse or cancel an order if we reasonably believe this requirement is not met.`,
        ],
      ],
    },
    {
      id: "accounts",
      title: "3. Accounts",
      paragraphs: [
        [
          `You are responsible for the accuracy of the name, email, phone number, and delivery details you provide, and for keeping them up to date. Orders are fulfilled to the address and contact details submitted at checkout.`,
        ],
        [
          `Keep your password confidential. You are responsible for activity under your account unless you have notified us that it is being used without your authority and you have taken reasonable care. Tell us promptly at ${siteConfig.email} or ${siteConfig.phone} if you suspect unauthorised access.`,
        ],
        [
          `We may suspend or close an account that is used in breach of these Terms, for fraud, or to protect customers, our staff, or the website. You may ask us to close your account by writing to ${siteConfig.email}. We may retain records we are required to keep, including invoices and tax records.`,
        ],
      ],
    },
    {
      id: "products",
      title: "4. Products",
      paragraphs: [
        [
          `We sell food products, including fried and baked savouries, sweets, gajak, and gift hampers. Products are prepared in a dedicated 100% shuddh (pure vegetarian) kitchen. Where a product is described as Jain or as prepared without onion or garlic, that description applies to that product as labelled. Other products in the same kitchen may contain onion, garlic, dairy, gluten, nuts, sesame, or other common allergens.`,
        ],
        [
          `Our FSSAI licence number is ${siteConfig.fssai}. Manufacturing and packing details printed on the pack prevail if they differ from a website summary.`,
        ],
        [
          `Ingredient lists, allergen information, and shelf-life on the product label are part of the product information. Read the label before consumption, especially if you have an allergy or intolerance. Tell us before you order if you need a clarification we can reasonably give; we do not give medical or dietary advice.`,
        ],
        [
          `Photographs, weights shown in marketing text, and styling are indicative. Natural variation in colour, spice level, piece size, and fried finish is normal for handmade food. A minor difference of that kind is not a defect. The net quantity on the label is the quantity you buy.`,
        ],
        [
          `Catalogue items are offered subject to availability and fresh-batch production. We may limit quantities, discontinue a product, or decline an order. If we cannot supply an item after you have paid, we will tell you and refund the amount paid for the unavailable item.`,
        ],
      ],
    },
    {
      id: "pricing",
      title: "5. Pricing",
      paragraphs: [
        [
          `Prices are shown in Indian Rupees (INR) and are inclusive of applicable goods and services tax unless checkout expressly shows a tax line. Shipping charges, when they apply, are shown before you pay.`,
        ],
        [
          `We take care to price products correctly. If a product is listed at an obvious pricing error, or at a price we could not reasonably have intended, we may cancel the order, or the affected line, and refund any amount you have paid for it. We will contact you before doing so where we have your details.`,
        ],
        [
          `A price change after you place an order does not change the price of that order. The price you pay is the price confirmed at checkout, less any valid coupon applied to that order.`,
        ],
      ],
    },
    {
      id: "orders",
      title: "6. Orders and payments",
      paragraphs: [
        [
          `Submitting an order is an offer to buy the products on these Terms. We accept the offer when we send an order confirmation, or when we dispatch the order, whichever is earlier. A payment authorisation alone is not acceptance if we later cancel because of unavailability, a pricing error, or a suspected breach of these Terms.`,
        ],
        [
          `Online payments are processed by Razorpay Software Private Limited (Razorpay). Card, UPI, and net-banking credentials are collected by Razorpay or the relevant bank or UPI app. We do not store your full card number, card CVV, or UPI PIN. Cash on Delivery is available only where checkout offers it.`,
        ],
        [
          `You authorise us and Razorpay to charge the amount confirmed at checkout, including shipping. If a payment fails, is reversed, or is reported as unauthorised, we may pause or cancel the order until the payment is confirmed.`,
        ],
        [
          `We may cancel an order, in full or in part, if a product is unavailable, if we suspect fraud or resale abuse, if the delivery address cannot be served, or if these Terms are breached. If we cancel after payment, we will refund the amount paid for the cancelled portion to the original payment method, or as Razorpay and your bank allow. Refund timing depends on the bank or payment instrument and is typically a few working days after we initiate it.`,
        ],
        [
          `You may ask us to cancel an order by contacting ${siteConfig.email} or ${siteConfig.phone} with your order ID. We will cancel if the order has not been dispatched. Once a perishable order is dispatched, cancellation follows the Shipping & Returns policy.`,
        ],
      ],
    },
    {
      id: "coupons",
      title: "7. Coupons and offers",
      paragraphs: [
        [
          `Coupons, promotional codes, and festive offers are invitations to treat. They are valid only for the period, products, minimum order value, and channels we state, and only while they remain published or issued to you.`,
        ],
        [
          `Unless we say otherwise, one coupon applies to an order. Coupons cannot be exchanged for cash, combined in a way we have not allowed, or transferred. We may refuse a coupon that is expired, altered, used contrary to its conditions, or obtained by mistake or misuse.`,
        ],
        [
          `We may withdraw or correct an offer that is published in error, or that is subject to abuse, including bulk creation of accounts to reuse a code. Withdrawal does not affect an order we have already accepted with that offer correctly applied.`,
        ],
      ],
    },
    {
      id: "shipping",
      title: "8. Shipping, delivery, and perishable food",
      paragraphs: [
        [
          `Delivery areas, dispatch times, shipping charges, the crispness warranty, and returns are set out in our `,
          { text: "Shipping & Returns", href: "/shipping-returns" },
          ` policy. Refunds and category-specific return rules are in our `,
          { text: "Refund & Return Policy", href: "/refund-return-policy" },
          `, which also forms part of these Terms for every order.`,
        ],
        [
          `Our products are perishable food. Shelf life is short compared with packaged groceries, and texture depends on handling after delivery. Risk in the goods passes to you on delivery to the address you gave, or to a person who accepts the parcel there. Until then we remain responsible for loss or damage in transit, subject to the claims window in the Shipping & Returns policy.`,
        ],
        [
          `Because the goods are perishable, we do not accept change-of-mind returns of opened food. If a parcel arrives damaged, or crispness is compromised in transit, contact us within the time stated in the Shipping & Returns policy with your order ID and photographs. Statutory rights under the Consumer Protection Act, 2019, including rights in respect of defective goods, are not excluded.`,
        ],
        [
          `You are responsible for an address, phone number, or recipient name that is incomplete or wrong. Re-delivery or return-to-origin charges caused by that may be charged to you. Someone at the address should be available to receive perishable food.`,
        ],
      ],
    },
    {
      id: "prohibited",
      title: "9. Prohibited use",
      paragraphs: [
        [
          `You must not misuse the website or an order. That includes attempting to access accounts, systems, or data without authorisation; probing or disrupting the website; scraping in a way that degrades the service; placing fraudulent, abusive, or speculative orders; reselling products while presenting them as your own manufacture; or using the website in breach of applicable law.`,
        ],
        [
          `You must not upload or send content that is unlawful, defamatory, obscene, or that infringes another person's rights. We may remove such content and cancel related orders.`,
        ],
      ],
    },
    {
      id: "ip",
      title: "10. Intellectual property",
      paragraphs: [
        [
          `The website, the ${siteConfig.name} name and logos, product photographs, text, recipes as expressed on the website, and page design are owned by us or our licensors. You may view them for personal shopping. You may not copy, republish, or use them for commercial purposes without our prior written consent, except as allowed by law.`,
        ],
        [
          `Nothing in these Terms transfers any intellectual property to you. Product names and trade dress of third parties, if shown, remain those parties' property.`,
        ],
      ],
    },
    {
      id: "user-content",
      title: "11. Reviews and other content you submit",
      paragraphs: [
        [
          `If you submit a review, testimonial, photograph, or enquiry, you confirm that it is yours to give and that it is lawful and honest. You grant us a non-exclusive, royalty-free licence to use that content on the website, in customer care, and in ordinary marketing of our products, including editing it for length and clarity. You may ask us to stop using a review you wrote by emailing ${siteConfig.email}; we will do so within a reasonable time, except where we need to keep a copy for a legal claim or a record of a complaint.`,
        ],
        [
          `We do not have to publish a review. We may refuse or remove content that we reasonably believe is fake, irrelevant, offensive, or in breach of these Terms.`,
        ],
      ],
    },
    {
      id: "liability",
      title: "12. Limitation of liability",
      paragraphs: [
        [
          `The website and products are provided with reasonable care. To the extent the law allows, we are not liable for loss that was not a foreseeable result of our breach, or for loss of profit, loss of goodwill, or indirect loss arising from use of the website or from an order.`,
        ],
        [
          `Subject to the next paragraph, our total liability arising out of an order is limited to the amount you paid for that order.`,
        ],
        [
          `Nothing in these Terms limits or excludes liability for death or personal injury caused by negligence, for fraud or fraudulent misrepresentation, for a defective product where liability cannot be limited under the Consumer Protection Act, 2019, or for any other liability that Indian law does not allow us to limit. Your statutory rights as a consumer, including the right to a remedy for a defect, deficiency, or unfair contract term, remain in force.`,
        ],
      ],
    },
    {
      id: "indemnity",
      title: "13. Indemnity",
      paragraphs: [
        [
          `If you use the website or place an order in breach of these Terms, or if content you submit infringes a third party's rights, you will indemnify us against losses, claims, and reasonable legal costs that result, except to the extent we caused them. This does not apply to a claim by you as a consumer about our products or services.`,
        ],
      ],
    },
    {
      id: "force-majeure",
      title: "14. Force majeure",
      paragraphs: [
        [
          `We are not liable for delay or failure to perform where it is caused by events beyond our reasonable control, including natural disaster, epidemic, fire, flood, war, riot, government action, failure of power or telecoms, courier or airline disruption, or shortage of ingredients we could not reasonably avoid. We will tell you as soon as we reasonably can and will refund amounts paid for goods we cannot supply.`,
        ],
      ],
    },
    {
      id: "privacy",
      title: "15. Privacy and communications",
      paragraphs: [
        [
          `We collect and use personal information as described in our `,
          { text: "Privacy Policy", href: "/terms-privacy#privacy" },
          `. That policy covers order details, account data, and the payment information our payment partners handle.`,
        ],
        [
          `By creating an account or placing an order, you agree that we may send transactional messages about that account or order by email, SMS, or phone, including confirmation, dispatch, and delivery updates. These are part of the service, not marketing.`,
        ],
        [
          `Festive offers and newsletters are sent only where you have opted in, including through a newsletter form or a consent box. You may withdraw that consent at any time using the unsubscribe link or by writing to ${siteConfig.email}. Withdrawal does not stop transactional messages about an order you have placed.`,
        ],
      ],
    },
    {
      id: "law",
      title: "16. Governing law and jurisdiction",
      paragraphs: [
        [
          `These Terms are governed by the laws of India. Subject to the consumer forum jurisdiction you may have under the Consumer Protection Act, 2019, the courts at Kota, Rajasthan, India have exclusive jurisdiction over disputes arising out of these Terms, the website, or an order.`,
        ],
        [
          `We are established at ${siteConfig.city}, India. Nothing in this section removes a right you have to approach a consumer commission that the Consumer Protection Act allows you to use.`,
        ],
      ],
    },
    {
      id: "grievance",
      title: "17. Grievance officer",
      paragraphs: [
        [
          `For complaints about the website or an order, contact the Grievance Officer of ${siteConfig.legalName}. This appointment is made for the Consumer Protection (E-Commerce) Rules, 2020, and for the Information Technology Act, 2000 and the rules made under it, including the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, to the extent those rules apply to us.`,
        ],
        [
          `Grievance Officer, ${siteConfig.legalName}, ${siteConfig.city}, India. Email: ${siteConfig.email}. Phone: ${siteConfig.phone}. Please include your name, order ID if you have one, and a short description of the complaint.`,
        ],
        [
          `We will acknowledge a complaint within 48 hours of receiving it, and we will aim to resolve it within one month of receiving it. If you are not satisfied, you may use the remedies available under the Consumer Protection Act, 2019, including the consumer commissions.`,
        ],
      ],
    },
    {
      id: "changes",
      title: "18. Changes to these Terms",
      paragraphs: [
        [
          `We may update these Terms when our products, payments, or legal duties change. The date at the top of this page is the date of the current version. The version published at the time you place an order applies to that order. If you continue to use the website after an update, the updated Terms apply to later use and later orders.`,
        ],
        [
          `If a change is material and the law requires us to give you notice, we will do so by a notice on the website or by email to the address on your account.`,
        ],
      ],
    },
  ] satisfies readonly TermsSection[],
} as const;
