"use client";

import { ChevronDown } from "lucide-react";
import { Accordion } from "@heroui/react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { supportFaqs, supportMeta } from "@/data/customer-care";
import { siteConfig } from "@/data/home";

export function SupportFaqsView() {
  return (
    <main className="container-jj py-6 md:py-10">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Customer Support FAQs" },
        ]}
      />

      <p className="label-sm uppercase tracking-widest text-primary">
        Customer Care
      </p>
      <h1 className="font-display mt-2 text-3xl font-semibold text-on-surface md:text-4xl">
        {supportMeta.title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-on-surface-variant md:text-base">
        {supportMeta.description} Reach us at{" "}
        <a
          href={`mailto:${siteConfig.email}`}
          className="font-semibold text-primary hover:underline"
        >
          {siteConfig.email}
        </a>{" "}
        or {siteConfig.phone}.
      </p>

      <div className="mt-8 max-w-3xl rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-2 shadow-sm sm:p-4">
        <Accordion className="w-full" variant="surface" allowsMultipleExpanded>
          {supportFaqs.map((item) => (
            <Accordion.Item key={item.id} id={item.id}>
              <Accordion.Heading>
                <Accordion.Trigger className="text-left font-semibold text-on-surface">
                  {item.question}
                  <Accordion.Indicator>
                    <ChevronDown className="h-4 w-4" />
                  </Accordion.Indicator>
                </Accordion.Trigger>
              </Accordion.Heading>
              <Accordion.Panel>
                <Accordion.Body className="text-sm leading-6 text-on-surface-variant">
                  {item.answer}
                </Accordion.Body>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </main>
  );
}
