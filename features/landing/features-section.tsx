"use client";

import { motion } from "framer-motion";
import { FileUp, Palette, Wand2, PenLine, LayoutTemplate, Smartphone } from "lucide-react";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: FileUp,
    title: "Resume in, portfolio out",
    description: "Drop a PDF or DOCX. We extract your name, roles, skills, and projects automatically.",
  },
  {
    icon: Palette,
    title: "Style from inspiration",
    description: "Upload a moodboard or screenshot and we derive a color palette, type, and mood from it.",
  },
  {
    icon: Wand2,
    title: "AI assembled layout",
    description: "Hero, about, skills, experience, projects, and contact, composed and edited for you.",
  },
  {
    icon: PenLine,
    title: "Everything editable",
    description: "Every word, color, and section is yours to tune in a live sidebar editor.",
  },
  {
    icon: LayoutTemplate,
    title: "Premium by default",
    description: "Considered type scale, spacing, and motion. The kind of polish you'd hire a designer for.",
  },
  {
    icon: Smartphone,
    title: "Responsive, always",
    description: "Every generated portfolio adapts cleanly from a 27\" display down to a phone.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-28">
      <div className="container">
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="text-balance font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Everything a designer would do, automated.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Portfolio AI handles extraction, styling, layout, and copy so you can go from resume to
            live portfolio without opening a design tool.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
            >
              <Card className="group h-full p-6 transition-colors hover:border-primary/40">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
