import { describe, it, expect } from "vitest";
import { TEMPLATE_REGISTRY, DEFAULT_TEMPLATE_ID, listTemplates, templateExists, getTemplate } from "./registry";

describe("template registry", () => {
  it("registers all available templates", () => {
    const ids = listTemplates().map((t) => t.id);
    // "default" is the canonical id for the Minimal template (see registry.ts doc comment).
    expect(ids).toEqual(expect.arrayContaining(["default", "cinematic", "whimsical", "brutalist", "glass", "bento", "editorial", "neon"]));
  });

  it("has a unique id for every distinct (deduplicated) template", () => {
    const ids = listTemplates().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("deduplicates the default/minimal alias into a single entry", () => {
    expect(listTemplates().length).toBe(8);
  });

  it("has a default template that exists in the registry", () => {
    expect(TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_ID]).toBeDefined();
    expect(templateExists(DEFAULT_TEMPLATE_ID)).toBe(true);
  });

  it("falls back to the default template for an unknown id", () => {
    const fallback = getTemplate("some-template-that-does-not-exist");
    expect(fallback.id).toBe(DEFAULT_TEMPLATE_ID);
  });

  it("falls back to the default template for an undefined id (missing on old/foreign data)", () => {
    const fallback = getTemplate(undefined);
    expect(fallback.id).toBe(DEFAULT_TEMPLATE_ID);
  });

  it("templateExists is false for an unknown id and true for every registered one", () => {
    expect(templateExists("not-a-real-template")).toBe(false);
    expect(templateExists(undefined)).toBe(false);
    for (const id of Object.keys(TEMPLATE_REGISTRY)) {
      expect(templateExists(id)).toBe(true);
    }
  });

  it("every template declares a render component and full capabilities", () => {
    for (const def of listTemplates()) {
      expect(typeof def.render).toBe("function");
      expect(def.capabilities.supportsHero).toBe(true);
      expect(def.capabilities.supportsAbout).toBe(true);
      expect(def.capabilities.supportsSkills).toBe(true);
      expect(def.capabilities.supportsExperience).toBe(true);
      expect(def.capabilities.supportsProjects).toBe(true);
      expect(def.capabilities.supportsContact).toBe(true);
    }
  });

  it("'minimal' resolves to the same definition as 'default'", () => {
    expect(getTemplate("minimal")).toBe(getTemplate("default"));
  });
});
