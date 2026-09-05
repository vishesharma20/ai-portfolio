"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Plus, Trash2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useGeneratorStore, useGeneratorActions } from "@/lib/store/generator-store";

const coreFieldsSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  summary: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
});
type CoreFields = z.infer<typeof coreFieldsSchema>;

export function StepConfirmResume() {
  const resumeData = useGeneratorStore((s) => s.resumeData);
  const actions = useGeneratorActions();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CoreFields>({
    resolver: zodResolver(coreFieldsSchema),
    defaultValues: resumeData,
  });

  // Re-hydrate the form if resumeData changes externally (e.g. after AI extraction).
  useEffect(() => {
    reset(resumeData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeData.name]);

  // Push core-field edits into the store as the user types.
  useEffect(() => {
    const sub = watch((values) => {
      actions.updateResumeField("name", values.name ?? "");
      actions.updateResumeField("title", values.title ?? "");
      actions.updateResumeField("summary", values.summary ?? "");
      actions.updateResumeField("email", values.email ?? "");
      actions.updateResumeField("phone", values.phone ?? "");
      actions.updateResumeField("location", values.location ?? "");
    });
    return () => sub.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const onSubmit = () => actions.setStep("inspiration");

  const skillsInputDefault = resumeData.skills.join(", ");

  return (
    <div className="space-y-8">
      <div className="text-center">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
          <Sparkles className="h-3 w-3" /> Extracted, review and edit anything below
        </div>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Confirm your details.
        </h1>
        <p className="mt-3 text-muted-foreground">Everything here is editable, including later in the sidebar.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register("name")} placeholder="Jordan Lee" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" {...register("title")} placeholder="Product Designer" />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="summary">Summary</Label>
              <Textarea id="summary" {...register("summary")} placeholder="A short, punchy bio." rows={3} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" {...register("email")} placeholder="you@example.com" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" {...register("phone")} placeholder="+1 555 000 0000" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="location">Location</Label>
                <Input id="location" {...register("location")} placeholder="Los Angeles, CA" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Comma-separated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              key={skillsInputDefault}
              defaultValue={skillsInputDefault}
              onBlur={(e) =>
                actions.updateResumeField(
                  "skills",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
              placeholder="Figma, TypeScript, Motion Design"
            />
            <div className="flex flex-wrap gap-2">
              {resumeData.skills.map((skill) => (
                <Badge key={skill} variant="secondary">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Experience</CardTitle>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={actions.addExperience}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {resumeData.experience.length === 0 && (
              <p className="text-sm text-muted-foreground">No experience yet. Add one.</p>
            )}
            {resumeData.experience.map((exp, i) => (
              <div key={exp.id}>
                {i > 0 && <Separator className="mb-5" />}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    defaultValue={exp.role}
                    placeholder="Role"
                    onBlur={(e) => actions.updateExperience(exp.id, { role: e.target.value })}
                  />
                  <Input
                    defaultValue={exp.company}
                    placeholder="Company"
                    onBlur={(e) => actions.updateExperience(exp.id, { company: e.target.value })}
                  />
                  <Input
                    defaultValue={exp.startDate}
                    placeholder="Start (e.g. 2022)"
                    onBlur={(e) => actions.updateExperience(exp.id, { startDate: e.target.value })}
                  />
                  <Input
                    defaultValue={exp.endDate}
                    placeholder="End (e.g. Present)"
                    onBlur={(e) => actions.updateExperience(exp.id, { endDate: e.target.value })}
                  />
                </div>
                <Textarea
                  defaultValue={exp.description}
                  placeholder="What did you do?"
                  rows={2}
                  className="mt-3"
                  onBlur={(e) => actions.updateExperience(exp.id, { description: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => actions.removeExperience(exp.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Projects</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={actions.addProject}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {resumeData.projects.length === 0 && (
              <p className="text-sm text-muted-foreground">No projects yet. Add one.</p>
            )}
            {resumeData.projects.map((project, i) => (
              <div key={project.id}>
                {i > 0 && <Separator className="mb-5" />}
                <Input
                  defaultValue={project.title}
                  placeholder="Project title"
                  onBlur={(e) => actions.updateProject(project.id, { title: e.target.value })}
                />
                <Textarea
                  defaultValue={project.description}
                  placeholder="What's it about?"
                  rows={2}
                  className="mt-3"
                  onBlur={(e) => actions.updateProject(project.id, { description: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => actions.removeProject(project.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Education</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={actions.addEducation}>
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {resumeData.education.length === 0 && (
              <p className="text-sm text-muted-foreground">No education yet. Add one.</p>
            )}
            {resumeData.education.map((edu, i) => (
              <div key={edu.id}>
                {i > 0 && <Separator className="mb-5" />}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input
                    defaultValue={edu.school}
                    placeholder="School"
                    onBlur={(e) => actions.updateEducation(edu.id, { school: e.target.value })}
                  />
                  <Input
                    defaultValue={edu.degree}
                    placeholder="Degree"
                    onBlur={(e) => actions.updateEducation(edu.id, { degree: e.target.value })}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => actions.removeEducation(edu.id)}
                  className="mt-2 flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" /> Remove
                </button>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <Button type="button" variant="ghost" onClick={() => actions.setStep("upload")}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button type="submit" size="lg">
            Continue <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
