// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { TemplateGallery } from "./template-gallery";
import { listTemplates } from "./registry";
import { emptyResumeData } from "@/types/resume";
import { defaultDesignTokens } from "@/types/design-tokens";

describe("TemplateGallery stays lightweight", () => {
  it("renders one card per registered template, and zero real section trees", () => {
    const { container } = render(
      <TemplateGallery
        resumeData={{ ...emptyResumeData, name: "Ada Lovelace", title: "Engineer" }}
        tokens={defaultDesignTokens}
        selectedTemplateId="default"
        onSelect={() => {}}
      />
    );

    // One button/card per distinct template — the gallery, not full live pages.
    expect(container.querySelectorAll("button").length).toBe(listTemplates().length);

    // A real HeroSection (or any other section component) always renders a
    // <section> element (see hero-section.tsx). The gallery's swatches are
    // plain <div>s — if this ever finds a <section>, something regressed
    // into mounting a full template tree per card instead of a lightweight
    // preview, which is exactly what Stage 6 explicitly warns against.
    expect(container.querySelectorAll("section").length).toBe(0);
  });
});
