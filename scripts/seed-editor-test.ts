import { createPortfolio, updatePortfolio, getPortfolio } from "@/lib/db/portfolios";

async function main() {
  const userId = "f28xs1fjfreCIEcRWWYVEH75o0fvHR64";
  const p = await createPortfolio(userId);
  const loaded = await getPortfolio(p.metadata.id, userId);
  if (!loaded) throw new Error("fail");
  loaded.content.resume.name = "Editor Test User";
  loaded.content.resume.title = "QA Engineer";
  loaded.content.resume.summary = "Testing the new visual editor.";
  loaded.content.resume.skills = ["Testing", "Debugging"];
  await updatePortfolio(p.metadata.id, userId, loaded);
  console.log(p.metadata.id);
}
main();
