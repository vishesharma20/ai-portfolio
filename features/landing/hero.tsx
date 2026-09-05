"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-28 pt-40">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute right-[5%] top-[20%] h-[360px] w-[360px] rounded-full bg-accent/20 blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern bg-[size:56px_56px] opacity-[0.03] mask-fade-b" />
      </div>

      {/* subtle floating doodles */}
      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute left-[8%] top-[22%] hidden h-10 w-10 text-primary/50 sm:block"
        animate={{ y: [0, -10, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M50 5 L58 42 L95 50 L58 58 L50 95 L42 58 L5 50 L42 42 Z"
          fill="currentColor"
        />
      </motion.svg>
      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        className="pointer-events-none absolute right-[10%] top-[38%] hidden h-8 w-8 text-accent/60 md:block"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      >
        <path
          d="M50 88 C20 65 5 45 5 28 C5 12 18 3 32 3 C42 3 48 9 50 15 C52 9 58 3 68 3 C82 3 95 12 95 28 C95 45 80 65 50 88 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
        />
      </motion.svg>

      <div className="container flex flex-col items-center text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={0}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-4 py-1.5 text-xs text-muted-foreground"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          AI generated, fully editable, yours in a minute
        </motion.div>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={1}
          className="text-balance font-display text-[clamp(2.75rem,7vw,5.5rem)] font-medium leading-[1.02] tracking-tight"
        >
          Your resume, reborn as a
          <br />
          <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
            portfolio worth sharing.
          </span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={2}
          className="mt-7 max-w-xl text-balance text-lg text-muted-foreground"
        >
          Upload a resume, add a bit of visual inspiration, and Portfolio AI designs, writes, and
          builds a premium portfolio site, ready to edit, ready to share.
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          custom={3}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/generator">
              Generate my portfolio <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-4 w-4" />
            Under 60 seconds &middot; no credit card
          </div>
        </motion.div>
      </div>
    </section>
  );
}
