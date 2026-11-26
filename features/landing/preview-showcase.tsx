"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Circle } from "lucide-react";

export function PreviewShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const rotate = useTransform(scrollYProgress, [0, 1], [2, -2]);

  return (
    <section id="preview" ref={ref} className="py-28">
      <div className="container">
        <div className="mx-auto mb-14 max-w-xl text-center">
          <h2 className="text-balance font-display text-4xl font-medium tracking-tight sm:text-5xl">
            See what &ldquo;generated&rdquo; actually looks like.
          </h2>
          <p className="mt-4 text-muted-foreground">
            One resume, one inspiration image, one portfolio, styled entirely from your inputs.
          </p>
        </div>

        <motion.div style={{ y, rotate }} className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-black/40">
            <div className="flex items-center gap-1.5 border-b border-border bg-secondary/40 px-4 py-3">
              <Circle className="h-2.5 w-2.5 fill-destructive text-destructive" />
              <Circle className="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
              <Circle className="h-2.5 w-2.5 fill-accent text-accent" />
              <div className="ml-4 h-5 flex-1 max-w-xs rounded-md bg-secondary/70" />
            </div>

            <div className="grid grid-cols-1 gap-8 bg-gradient-to-br from-primary/10 via-background to-accent/5 p-10 sm:grid-cols-2 sm:p-14">
              <div className="flex flex-col justify-center gap-4">
                <div className="h-2 w-24 rounded-full bg-accent/60" />
                <div className="h-8 w-4/5 rounded-md bg-foreground/90" />
                <div className="h-8 w-3/5 rounded-md bg-foreground/50" />
                <div className="mt-2 h-2.5 w-full rounded-full bg-muted-foreground/30" />
                <div className="h-2.5 w-5/6 rounded-full bg-muted-foreground/20" />
                <div className="mt-4 flex gap-2">
                  <div className="h-9 w-28 rounded-full bg-primary/80" />
                  <div className="h-9 w-24 rounded-full border border-border" />
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="grid w-full max-w-[260px] grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl border border-border bg-card/80"
                      style={{ opacity: 1 - i * 0.12 }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
