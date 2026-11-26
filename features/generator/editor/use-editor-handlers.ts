"use client";

import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";
import { PortfolioEditHandlers } from "@/features/portfolio/portfolio-editor-context";

/**
 * The one place that bridges the full Zustand store into the narrow
 * `PortfolioEditHandlers` shape the render tree consumes via
 * `PortfolioEditProvider`. This is the only file in the editor layer that
 * needs to know both shapes exist.
 */
export function useEditorHandlers(): PortfolioEditHandlers {
  const textStyles = useGeneratorStore((s) => s.textStyles);
  const actions = useGeneratorActions();

  return {
    textStyles,
    setTextStyle: actions.setTextStyle,
    clearTextStyle: actions.clearTextStyle,

    updateResumeField: actions.updateResumeField,
    updateSectionCopy: actions.updateSectionCopy,

    addExperience: actions.addExperience,
    updateExperience: actions.updateExperience,
    removeExperience: actions.removeExperience,
    addHighlight: actions.addHighlight,
    updateHighlight: actions.updateHighlight,
    removeHighlight: actions.removeHighlight,

    addProject: actions.addProject,
    updateProject: actions.updateProject,
    removeProject: actions.removeProject,
    addProjectTag: actions.addProjectTag,
    updateProjectTag: actions.updateProjectTag,
    removeProjectTag: actions.removeProjectTag,

    addSkill: actions.addSkill,
    updateSkill: actions.updateSkill,
    removeSkill: actions.removeSkill,

    addLink: actions.addLink,
    updateLink: actions.updateLink,
    removeLink: actions.removeLink,

    updateDecoration: actions.updateDecoration,
    removeDecoration: actions.removeDecoration,
  };
}
