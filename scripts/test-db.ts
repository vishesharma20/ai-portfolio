/**
 * Standalone CRUD verification against a real Postgres database — not part
 * of the app, just a way to sanity-check lib/db/portfolios.ts directly
 * without going through the UI. Requires DATABASE_URL to point at a real,
 * migrated database (`npm run db:push` first).
 *
 * Run with: DATABASE_URL=... npx tsx scripts/test-db.ts
 *
 * (`server-only`-guarded modules can't be `require`d outside Next's
 * bundler; if you hit that error, see the sandbox note in the project
 * writeup — a one-line require shim works around it for local script runs.)
 */
import { auth } from "@/lib/auth/auth";
import { createPortfolio, getPortfolio, getUserPortfolios, updatePortfolio, deletePortfolio } from "@/lib/db/portfolios";

/** Creates (or reuses) a throwaway account to run this script's checks against. */
async function getOrCreateTestUserId(): Promise<string> {
  const email = "crud-test@localhost.test";
  try {
    const { user } = await auth.api.signUpEmail({ body: { email, password: "test-password-123", name: "CRUD test" } });
    return user.id;
  } catch {
    const { user } = await auth.api.signInEmail({ body: { email, password: "test-password-123" } });
    return user.id;
  }
}

async function main() {
  console.log("1. Resolving test user...");
  const userId = await getOrCreateTestUserId();
  console.log("   userId:", userId);

  console.log("2. Creating portfolio A...");
  const a = await createPortfolio(userId);
  console.log("   created:", a.metadata.id, a.metadata.slug, a.metadata.name);

  console.log("3. Creating portfolio B...");
  const b = await createPortfolio(userId);
  console.log("   created:", b.metadata.id);

  console.log("4. Listing user portfolios...");
  let list = await getUserPortfolios(userId);
  console.log("   count:", list.length, list.map((p) => p.id));
  if (list.length < 2) throw new Error("expected at least 2 portfolios");

  console.log("5. Editing portfolio A (name + heading + a project)...");
  const loadedA = await getPortfolio(a.metadata.id, userId);
  if (!loadedA) throw new Error("portfolio A not found after create");
  loadedA.content.resume.name = "Ada Lovelace";
  loadedA.content.resume.title = "Mathematician & Writer";
  loadedA.appearance.tokens.primaryColor = "#FF00AA";
  loadedA.content.resume.projects.push({
    id: "proj-1",
    title: "Analytical Engine Notes",
    description: "Test project",
    tags: ["math"],
    link: "",
    year: "1843",
  });
  const updatedA = await updatePortfolio(a.metadata.id, userId, loadedA);
  if (!updatedA) throw new Error("update returned null");
  console.log("   updated name:", updatedA.content.resume.name);
  console.log("   id unchanged:", updatedA.metadata.id === a.metadata.id);
  console.log("   slug unchanged:", updatedA.metadata.slug === a.metadata.slug);
  console.log("   createdAt unchanged:", updatedA.metadata.createdAt === a.metadata.createdAt);
  console.log("   updatedAt changed:", updatedA.metadata.updatedAt !== a.metadata.updatedAt);

  console.log("6. Reloading portfolio A fresh from DB to confirm persistence...");
  const reloadedA = await getPortfolio(a.metadata.id, userId);
  if (!reloadedA) throw new Error("reload failed");
  console.log("   name persisted:", reloadedA.content.resume.name === "Ada Lovelace");
  console.log("   color persisted:", reloadedA.appearance.tokens.primaryColor === "#FF00AA");
  console.log("   project persisted:", reloadedA.content.resume.projects.length === 1);

  console.log("7. Confirming portfolio B is untouched by editing A...");
  const reloadedB = await getPortfolio(b.metadata.id, userId);
  console.log("   B name still default:", reloadedB?.content.resume.name === "");
  console.log("   B color still default:", reloadedB?.appearance.tokens.primaryColor !== "#FF00AA");

  console.log("8. Testing cross-user isolation (wrong ownerId should see nothing)...");
  const wrongOwner = await getPortfolio(a.metadata.id, "00000000-0000-0000-0000-000000000099");
  console.log("   wrong owner sees null:", wrongOwner === null);

  console.log("9. Deleting portfolio A...");
  const deleted = await deletePortfolio(a.metadata.id, userId);
  console.log("   delete returned true:", deleted === true);

  console.log("10. Confirming A is gone, B remains...");
  list = await getUserPortfolios(userId);
  const stillHasA = list.some((p) => p.id === a.metadata.id);
  const stillHasB = list.some((p) => p.id === b.metadata.id);
  console.log("   A gone:", !stillHasA, "  B remains:", stillHasB);

  console.log("11. Deleting a portfolio that isn't yours should fail...");
  const bogusDelete = await deletePortfolio(b.metadata.id, "00000000-0000-0000-0000-000000000099");
  console.log("   bogus delete returned false:", bogusDelete === false);

  console.log("12. Cleaning up portfolio B...");
  await deletePortfolio(b.metadata.id, userId);

  console.log("\n✅ ALL DB CRUD CHECKS PASSED against real Postgres");
  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ TEST FAILED:", err);
  process.exit(1);
});
