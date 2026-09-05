"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "Do I need design experience?",
    a: "No. Portfolio AI makes every visual decision for you, and you can still tune anything afterward.",
  },
  {
    q: "What if I don't have a resume ready?",
    a: "You can fill in your details manually through a guided form instead of uploading a file.",
  },
  {
    q: "Is my data used to train anything?",
    a: "No. Your resume and images are only used to generate your portfolio.",
  },
];

export function CtaSection() {
  return (
    <>
      <section id="faq" className="py-24">
        <div className="container max-w-2xl">
          <h2 className="mb-10 text-center font-display text-3xl font-medium tracking-tight">
            Frequently asked
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border">
            {FAQS.map((item) => (
              <div key={item.q} className="p-6">
                <p className="font-medium">{item.q}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-28 pt-4">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/15 via-card to-accent/10 px-8 py-20 text-center"
          >
            <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:40px_40px] opacity-[0.04]" />
            <h2 className="text-balance font-display text-4xl font-medium tracking-tight sm:text-5xl">
              Your portfolio is 60 seconds away.
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Upload a resume, pick a vibe, and watch it come together.
            </p>
            <Button size="lg" className="mt-8" asChild>
              <Link href="/generator">
                Start building <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </>
  );
}
