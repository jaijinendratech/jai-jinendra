import { heritage } from "@/data/home";

export const aboutPage = {
  metaTitle: "About Jai Jinendra Sweets & Namkeens",
  metaDescription:
    "Established in 1984 at Aerodrome Circle, Kota, a legacy of traditional taste, quality ingredients, Jain catering, and trusted sweets & namkeens.",
  eyebrow: "A Legacy of Taste Since 1984",
  title: "About Jai Jinendra Sweets & Namkeens",
  intro:
    "Established in 1984 at Aerodrome Circle, Kota, Rajasthan, Jai Jinendra Sweets & Namkeens began its journey with our much-loved Kota Kachoris and Namkeens. We soon became a trusted name among families across Kota and Rajasthan for our distinctive taste, quality and consistency.",
  image: heritage.image,
  imageAlt: heritage.imageAlt,
  sections: [
    {
      id: "traditional-taste",
      title: "Traditional Taste, Quality Ingredients",
      paragraphs: [
        "At Jai Jinendra Sweets & Namkeens, quality has always been at the heart of everything we do. From selecting premium ingredients to maintaining hygienic preparation and production processes, we take every step to ensure that our customers receive products that meet high standards of freshness, taste and quality.",
        "Whether you're looking for Sweets for festivals, Namkeens for snack cravings, Gajak during the winter season, freshly baked Cookies with tea/coffee or Gifting Hampers for celebrations, Jai Jinendra brings together authentic flavours and trusted quality under one roof.",
      ],
    },
    {
      id: "catering",
      title: "Catering & Food for Celebrations",
      paragraphs: [
        "Our expertise in traditional Indian food also extends to catering for weddings, family functions, festivals, corporate events or any other special occasions. We help make celebrations more memorable with food that guests love.",
      ],
      cta: { label: "Explore Jain catering", href: "/catering" },
    },
    {
      id: "trusted-brand",
      title: "From a Small Beginning to a Trusted Food Brand",
      paragraphs: [
        "What started as a humble outlet in Kota, Rajasthan, in 1984 has grown into a cherished food brand built on generations of customer trust and appreciation. Our journey has been shaped by our commitment to taste, quality, authenticity and customer satisfaction.",
        "Today, Jai Jinendra Sweets & Namkeens continues to carry forward its legacy with the same passion that inspired us at the beginning. As we grow, our goal remains unchanged: to serve delicious Indian sweets, crunchy Namkeens, Kota Kachoris, Gajak and catering delicacies that bring people together and create moments worth remembering.",
      ],
    },
  ],
} as const;
