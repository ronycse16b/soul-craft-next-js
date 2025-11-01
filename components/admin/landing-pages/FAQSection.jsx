"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // adjust path if needed

export default function FAQSection({ faqs }) {
  return (
    <section className="w-full py-20 px-4 md:px-12 bg-white border-t">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center mb-12 text-gray-900">
          Frequently Asked Questions
        </h2>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className=" duration-300"
            >
              <AccordionTrigger className="px-5 py-4 text-gray-900 font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-5 pb-4 text-gray-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
