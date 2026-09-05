import { z } from "zod";

export const experienceSchema = z.object({
  id: z.string(),
  role: z.string().min(1, "Role is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional().default(""),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().default("Present"),
  description: z.string().optional().default(""),
  highlights: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  id: z.string(),
  school: z.string().min(1, "School is required"),
  degree: z.string().optional().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().optional().default(""),
  endDate: z.string().optional().default(""),
});

export const projectSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  tags: z.array(z.string()).default([]),
  link: z.string().optional().default(""),
  year: z.string().optional().default(""),
});

export const linkSchema = z.object({
  id: z.string(),
  label: z.string(),
  url: z.string(),
});

export const resumeDataSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional().default(""),
  email: z.string().optional().default(""),
  phone: z.string().optional().default(""),
  location: z.string().optional().default(""),
  skills: z.array(z.string()).default([]),
  experience: z.array(experienceSchema).default([]),
  education: z.array(educationSchema).default([]),
  projects: z.array(projectSchema).default([]),
  links: z.array(linkSchema).default([]),
  photoUrl: z.string().optional().default(""),
});

export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Link = z.infer<typeof linkSchema>;
export type ResumeData = z.infer<typeof resumeDataSchema>;

export const emptyResumeData: ResumeData = {
  name: "",
  title: "",
  summary: "",
  email: "",
  phone: "",
  location: "",
  skills: [],
  experience: [],
  education: [],
  projects: [],
  links: [],
  photoUrl: "",
};
