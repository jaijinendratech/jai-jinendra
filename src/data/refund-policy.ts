import { siteConfig } from "@/data/home";

export const refundReturnPolicyContent = {
  title: "Refund & Return Policy",
  description:
    "Returns, replacements, and refunds for Jai Jinendra namkeens, mithai, bakery, and festive hampers. We ship perishable vegetarian foods pan-India.",
  intro:
    "We pack every order fresh from our Kota kitchen with nitrogen sealing and food-grade packaging. Because sweets, namkeens, and bakery items are perishable, our policy balances food safety with fair resolution when something goes wrong in transit or at delivery.",
  updatedLabel: "Last updated: October 2026",
  sections: [
    {
      id: "overview",
      title: "Overview",
      paragraphs: [
        `This policy applies to purchases on ${siteConfig.url.replace("https://", "")} and through our official online checkout. It works together with our Shipping & Returns page, which covers delivery timelines and the crispness warranty.`,
        `Nothing in this policy limits your statutory rights under the Consumer Protection Act, 2019, including remedies for defective or misdescribed goods.`,
      ],
    },
    {
      id: "product-types",
      title: "By product category",
      paragraphs: [
        "Namkeens & savouries: sold in sealed packs for crispness. We do not accept opened packs for change-of-mind. If a pack arrives torn, crushed, or with compromised seal or texture due to transit, contact us within 48 hours with photos; we will replace or refund as below.",
        "Mithai & sweets: many items have a shorter shelf life and may need refrigeration where labelled. Consume within the printed best-before date. Returns for taste preference or opened boxes are not accepted.",
        "Bakery (cookies, biscuits, dry cakes): treated like packaged foods. Unopened, undamaged packs only qualify for transit-related claims within 48 hours of delivery.",
        "Gift hampers & combos: curated trays and multi-item boxes may be reviewed within 7 days if the outer packaging is unopened, undamaged, and the hamper has not been partially consumed. Custom corporate or event orders may have separate terms confirmed at enquiry stage.",
      ],
    },
    {
      id: "eligible",
      title: "When we replace or refund",
      paragraphs: [
        "Wrong item shipped (different SKU or quantity than invoiced).",
        "Parcel visibly damaged in transit and product inside is affected.",
        "Namkeen or snack crispness clearly compromised due to transit (our crispness warranty, report within 48 hours with outer carton and product photos).",
        "Missing items from your order when compared to the order confirmation.",
        "Order cancelled by you before dispatch, or cancelled by us because an item is unavailable (full refund of amount paid for that order).",
      ],
    },
    {
      id: "not-eligible",
      title: "What we cannot accept",
      paragraphs: [
        "Change-of-mind returns on opened or partially consumed food.",
        "Products stored incorrectly after delivery (heat, moisture, or open storage).",
        "Claims made after the reporting window (48 hours for transit damage or crispness; 7 days for unopened hampers where applicable).",
        "Minor cosmetic variation in hand-finished mithai or natural colour variation between batches.",
      ],
    },
    {
      id: "refunds",
      title: "Refund method & timing",
      paragraphs: [
        "Approved refunds are returned to the original payment method (UPI, card, net banking) via our payment partner. Please allow 5–10 working days for the amount to reflect, depending on your bank.",
        "Cash on Delivery orders eligible for refund are processed via UPI or bank transfer to the details you provide after verification.",
        "Shipping charges are non-refundable except where the entire order is cancelled by us or a full-order transit failure is confirmed.",
        "If a coupon or prepaid discount was applied, refunds are calculated on the amount actually paid after those discounts.",
      ],
    },
    {
      id: "how-to-report",
      title: "How to report an issue",
      paragraphs: [
        `Email ${siteConfig.email} or call ${siteConfig.phone} with your order ID, registered phone number, a short description, and clear photographs (outer shipping label, box, and affected products).`,
        "Our customer care team responds on working days, 10:00–18:00 IST. We may request additional information or arrange pickup of the affected parcel where required by our courier partner.",
      ],
    },
  ],
} as const;
