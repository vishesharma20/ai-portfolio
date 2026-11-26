// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import { createEmptyPortfolio } from "@/lib/portfolio/defaults";
import { PortfolioRenderer } from "@/features/portfolio/portfolio-renderer";
import { listTemplates } from "@/features/portfolio/templates/registry";
import { Portfolio } from "@/types/portfolio";

// jsdom doesn't implement matchMedia; usePrefersReducedMotion (used by every
// section, directly or via useSectionMotion/AmbientBackground) needs it.
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });

  // jsdom also doesn't implement IntersectionObserver; framer-motion's
  // `whileInView` (used by About/Skills/Experience/Projects/Contact) needs it.
  class MockIntersectionObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  // @ts-expect-error jsdom has no built-in IntersectionObserver type/implementation to satisfy exactly.
  window.IntersectionObserver = MockIntersectionObserver;
  // @ts-expect-error same as above, for code that references the global directly rather than via window.
  global.IntersectionObserver = MockIntersectionObserver;
});

/** A portfolio with real-looking content but animation off, so tests don't depend on GSAP's ScrollTrigger behavior under jsdom. */
function portfolioWithContent(templateId: string): Portfolio {
  const portfolio = createEmptyPortfolio();
  portfolio.template.templateId = templateId;
  portfolio.appearance.tokens = { ...portfolio.appearance.tokens, animationStyle: "none" };
  portfolio.content.resume = {
    ...portfolio.content.resume,
    name: "Ada Lovelace",
    title: "Software Engineer",
    summary: "Building things.",
    skills: ["TypeScript", "React"],
    experience: [
      { id: "e1", role: "Engineer", company: "Acme", location: "Remote", startDate: "2020", endDate: "Present", description: "", highlights: ["Shipped things"] },
    ],
    projects: [{ id: "p1", title: "A cool project", description: "Does a thing", tags: ["ts"], link: "", year: "2024" }],
  };
  return portfolio;
}

/**
 * A deliberately "kitchen sink" portfolio: long name/title, several skills,
 * 3+ experience entries, 4+ projects with long descriptions, decorations,
 * and a section-specific background override — exercising the same content
 * shape Stage 6's verification pass calls for, both with and without a
 * profile photo.
 */
function kitchenSinkPortfolio(templateId: string, withPhoto: boolean): Portfolio {
  const portfolio = createEmptyPortfolio();
  portfolio.template.templateId = templateId;
  portfolio.appearance.tokens = { ...portfolio.appearance.tokens, animationStyle: "none" };
  portfolio.appearance.decorations = [
    { id: "d1", kind: "emoji", content: "✨", xPercent: 10, yPercent: 10, rotation: 0, scale: 1 },
  ];
  portfolio.sections.backgrounds = {
    about: { url: "https://example.com/bg.jpg", blur: 0.4, focusX: 50, focusY: 50, zoom: 1.1 },
  };
  portfolio.content.resume = {
    ...portfolio.content.resume,
    name: "Dr. Evelyn Rosalind Whitfield-Nakamura, PhD",
    title: "Principal Staff Software Engineer, Distributed Systems & AI Research Lead",
    summary:
      "A very long summary describing many years of experience across distributed systems, machine learning infrastructure, and developer tooling, written the way an enthusiastic person genuinely over-fills a text box.",
    photoUrl: withPhoto ? "https://example.com/photo.jpg" : "",
    email: "evelyn@example.com",
    phone: "+1 555 0100",
    skills: ["TypeScript", "React", "Rust", "Distributed Systems", "Kubernetes", "ML Infra", "GraphQL", "PostgreSQL"],
    experience: [
      { id: "e1", role: "Principal Engineer", company: "Acme Corp", location: "Remote", startDate: "2022", endDate: "Present", description: "Leading the platform team.", highlights: ["Shipped the new pipeline", "Cut latency by 40%", "Mentored 6 engineers"] },
      { id: "e2", role: "Senior Engineer", company: "Globex", location: "NYC", startDate: "2018", endDate: "2022", description: "Owned the checkout service.", highlights: ["Migrated to microservices"] },
      { id: "e3", role: "Software Engineer", company: "Initech", location: "SF", startDate: "2015", endDate: "2018", description: "Built internal tools.", highlights: [] },
      { id: "e4", role: "Junior Engineer", company: "Umbrella Inc", location: "Austin", startDate: "2013", endDate: "2015", description: "", highlights: [] },
    ],
    projects: [
      { id: "p1", title: "Distributed Task Queue", description: "A fault-tolerant, horizontally scalable task queue with exactly-once delivery semantics, built from scratch over several months of careful design and iteration.", tags: ["Rust", "Kafka"], link: "https://example.com/p1", year: "2024" },
      { id: "p2", title: "ML Feature Store", description: "Centralized feature store powering real-time inference across a dozen production models.", tags: ["Python", "Feast"], link: "https://example.com/p2", year: "2023" },
      { id: "p3", title: "Design System", description: "A shared component library adopted across six product teams.", tags: ["React", "Storybook"], link: "", year: "2022" },
      { id: "p4", title: "Internal CLI Tooling", description: "Developer productivity tooling used company-wide.", tags: ["Go"], link: "https://example.com/p4", year: "2021" },
    ],
    links: [{ id: "l1", label: "GitHub", url: "https://github.com/example" }],
  };
  return portfolio;
}

describe("every registered template renders a valid Portfolio", () => {
  for (const def of listTemplates()) {
    it(`"${def.id}" (${def.name}) renders without throwing`, () => {
      const portfolio = portfolioWithContent(def.id);
      expect(() => render(<PortfolioRenderer portfolio={portfolio} />)).not.toThrow();
    });
  }
});

describe("templates tolerate missing optional content", () => {
  for (const def of listTemplates()) {
    it(`"${def.id}" renders a completely empty portfolio (no experience/projects/skills) without crashing`, () => {
      const portfolio = createEmptyPortfolio();
      portfolio.template.templateId = def.id;
      portfolio.appearance.tokens = { ...portfolio.appearance.tokens, animationStyle: "none" };
      // createEmptyPortfolio() already starts with empty experience/projects/skills/decorations —
      // exercised here explicitly so the intent is clear rather than incidental.
      expect(portfolio.content.resume.experience).toHaveLength(0);
      expect(portfolio.content.resume.projects).toHaveLength(0);
      expect(() => render(<PortfolioRenderer portfolio={portfolio} />)).not.toThrow();
    });
  }

  it("an unknown templateId falls back to the default template instead of crashing", () => {
    const portfolio = portfolioWithContent("a-template-id-that-does-not-exist");
    expect(() => render(<PortfolioRenderer portfolio={portfolio} />)).not.toThrow();
  });
});

describe("PortfolioRenderer works standalone (no editor, no Zustand, no provider)", () => {
  it("renders read-only with just a portfolio prop — no editHandlers", () => {
    const portfolio = portfolioWithContent("cinematic");
    const { container } = render(<PortfolioRenderer portfolio={portfolio} />);
    expect(container.textContent).toContain("Ada Lovelace");
  });
});

describe("every template renders a realistic 'kitchen sink' portfolio without crashing", () => {
  for (const def of listTemplates()) {
    it(`"${def.id}" renders long content, 4 experience entries, 4 projects, decorations, and a section background — without a photo`, () => {
      const portfolio = kitchenSinkPortfolio(def.id, false);
      const { container } = render(<PortfolioRenderer portfolio={portfolio} />);
      expect(container.textContent).toContain("Dr. Evelyn Rosalind Whitfield-Nakamura, PhD");
      expect(container.textContent).toContain("Distributed Task Queue");
      expect(container.textContent).toContain("Internal CLI Tooling");
    });

    it(`"${def.id}" renders the same kitchen-sink portfolio with a profile photo set`, () => {
      const portfolio = kitchenSinkPortfolio(def.id, true);
      expect(() => render(<PortfolioRenderer portfolio={portfolio} />)).not.toThrow();
    });
  }
});
