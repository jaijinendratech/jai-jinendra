import { siteConfig } from "@/data/home";

export const trackOrderMeta = {
  title: "Track Order",
  description:
    "Enter your order ID and registered phone or email to check the status of your Jai Jinendra Namkeens shipment.",
} as const;

export const shippingReturnsContent = {
  title: "Shipping & Returns",
  description:
    "Pan-India delivery timelines, free shipping thresholds, and our crispness warranty for Jai Jinendra Namkeens.",
  intro:
    "Every order leaves our Rajasthan kitchen nitrogen-sealed so crunch and aroma arrive intact. Below is how we ship, when replacements apply, and what to expect after checkout.",
  sections: [
    {
      id: "delivery",
      title: "Delivery",
      paragraphs: [
        `Free pan-India delivery on orders above ₹999. Orders under ₹999 may include a flat express shipping fee shown at checkout.`,
        `Fresh batches are packed the same day when possible and dispatched within 24 hours via air-courier partners. Metro cities typically receive parcels in 2–4 working days; remote pin codes may take 4–7 working days.`,
      ],
    },
    {
      id: "packaging",
      title: "Packaging & Freshness",
      paragraphs: [
        `Namkeens and mithai are sealed with food-grade nitrogen to lock in crispness without artificial preservatives. Please store airtight in a cool, dry place on arrival.`,
        `Mithai with shorter shelf life is labelled clearly — refrigerate where indicated and consume within the printed window.`,
      ],
    },
    {
      id: "returns",
      title: "Returns & Crispness Warranty",
      paragraphs: [
        `If crispness is compromised in transit, or a parcel arrives damaged, contact us within 48 hours of delivery with photos of the outer carton and product. We will ship a free replacement under our 100% Crispness Warranty.`,
        `Because our products are perishable foods, we cannot accept returns of opened packs for change-of-mind. Unopened, undamaged festive hampers may be reviewed case-by-case within 7 days of delivery.`,
      ],
    },
    {
      id: "contact",
      title: "Need Help?",
      paragraphs: [
        `Write to ${siteConfig.email} or call ${siteConfig.phone} with your order ID. Our care desk responds on working days between 10:00 and 18:00 IST.`,
      ],
    },
  ],
} as const;

export const supportFaqs = [
  {
    id: "place-order",
    question: "How do I place an order?",
    answer:
      "Browse the catalogue or Build Your Combo, add items to cart, and complete checkout with UPI, cards, net banking, or Cash on Delivery where available. You will receive an order confirmation by email or SMS.",
  },
  {
    id: "track",
    question: "How can I track my shipment?",
    answer:
      "Use Track Order with your order ID and the phone or email used at checkout. Tracking links from our courier partners are also shared once the parcel is handed over.",
  },
  {
    id: "jain-veg",
    question: "Are your products Jain / 100% pure vegetarian?",
    answer:
      "Our dedicated kitchen is 100% shuddh vegetarian. Look for Jain-friendly SKUs marked without onion or garlic. Every pack carries the green veg mark.",
  },
  {
    id: "storage",
    question: "How should I store namkeens and mithai?",
    answer:
      "Keep namkeens airtight in a cool, dry place away from sunlight. Refrigerate mithai where the label says so, and consume within the printed shelf life for best texture and flavour.",
  },
  {
    id: "shipping-cost",
    question: "Do you offer free shipping?",
    answer:
      "Yes — free pan-India delivery on orders above ₹999. Smaller orders show a flat shipping fee at checkout before you pay.",
  },
  {
    id: "corporate",
    question: "Can you help with corporate or wedding gifting?",
    answer:
      "Absolutely. Visit Gift Hampers or write to our gifting desk via hello@jaijinendra.com for multi-address dispatch, embossed tins, and bulk festive trays.",
  },
  {
    id: "payment",
    question: "Which payment methods do you accept?",
    answer:
      "UPI, Visa / Mastercard, net banking, and Cash on Delivery (where enabled). Card and UPI payments are processed by PCI-compliant gateways — we never store full card numbers.",
  },
  {
    id: "support-hours",
    question: "How do I reach customer support?",
    answer: `Email ${siteConfig.email} or call ${siteConfig.phone}. We respond on working days, 10:00–18:00 IST. For urgent transit issues, include your order ID and photos.`,
  },
] as const;

export const supportMeta = {
  title: "Customer Support FAQs",
  description:
    "Answers on ordering, shipping, Jain / pure-veg preparation, storage, and gifting from Jai Jinendra Namkeens.",
} as const;

export const termsPrivacyContent = {
  title: "Terms & Privacy",
  description:
    "Terms of use and privacy practices for shopping with Jai Jinendra Namkeens.",
  intro:
    "By browsing or purchasing from jaijinendra.com you agree to the terms below. We collect only what we need to fulfil orders and improve your festive gifting experience.",
  terms: [
    {
      id: "products",
      title: "Products & Availability",
      body: "Descriptions, weights, and images are provided in good faith. Fresh-batch frying means some SKUs may sell out; we will notify you promptly if a substitution or refund is required.",
    },
    {
      id: "pricing",
      title: "Pricing & Payment",
      body: "Prices are listed in Indian Rupees (INR) and include applicable taxes unless stated otherwise. Payment must clear before dispatch except where Cash on Delivery is offered.",
    },
    {
      id: "use",
      title: "Acceptable Use",
      body: "You agree not to misuse the site, attempt unauthorised access, or place fraudulent orders. We may cancel orders that appear abusive or violate applicable law.",
    },
    {
      id: "liability",
      title: "Limitation of Liability",
      body: "To the fullest extent permitted by law, our liability for any claim related to a product is limited to the amount paid for that product. Nothing here limits rights you have under mandatory consumer law.",
    },
  ],
  privacy: [
    {
      id: "collect",
      title: "Information We Collect",
      body: "Name, delivery address, phone, email, order history, and limited device / analytics data needed to run the storefront. Payment card details are handled by our PCI-compliant payment partners — we do not store full card numbers.",
    },
    {
      id: "use-data",
      title: "How We Use Data",
      body: "To fulfil and track orders, send transactional messages, respond to support requests, and (with consent) share festive offers. We do not sell your personal information.",
    },
    {
      id: "share",
      title: "Sharing",
      body: "We share data with courier partners, payment gateways, and essential service providers under confidentiality obligations. We may disclose information if required by law.",
    },
    {
      id: "rights",
      title: "Your Rights",
      body: `You may request access, correction, or deletion of personal data we hold, subject to legal retention needs for invoices and tax. Contact ${siteConfig.email} for data requests.`,
    },
  ],
  updatedLabel: "Last updated: March 2026",
} as const;
