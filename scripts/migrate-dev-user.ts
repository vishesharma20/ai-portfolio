/**
 * One-time migration: reassigns portfolios that belonged to the old
 * DEV_USER_ID placeholder (from before real authentication existed) to a
 * real Better Auth account, then retires the old `users` table.
 *
 * Safe to run more than once — every step checks before acting. If there's
 * nothing to migrate (no `users` table, or no portfolios under the legacy
 * dev id), it says so and exits without changing anything.
 *
 * Usage: DATABASE_URL=... BETTER_AUTH_SECRET=... npx tsx scripts/migrate-dev-user.ts
 */
import { Pool } from "pg";
import { auth } from "@/lib/auth/auth";

const LEGACY_DEV_USER_ID = process.env.DEV_USER_ID || "00000000-0000-0000-0000-000000000001";
const MIGRATED_EMAIL = "dev@localhost.test";
const MIGRATED_PASSWORD = "dev-migrated-password-123"; // dev-only; change immediately after first login

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  const legacyTable = await pool.query(
    `SELECT to_regclass('public.users') as exists`
  );
  if (!legacyTable.rows[0]?.exists) {
    console.log("No legacy 'users' table found — nothing to migrate.");
    await pool.end();
    return;
  }

  const legacyPortfolios = await pool.query(
    `SELECT id FROM portfolios WHERE owner_id::text = $1`,
    [LEGACY_DEV_USER_ID]
  );
  console.log(`Found ${legacyPortfolios.rowCount} portfolio(s) owned by the legacy dev user.`);

  if (legacyPortfolios.rowCount && legacyPortfolios.rowCount > 0) {
    console.log(`Creating a real account to receive them: ${MIGRATED_EMAIL}`);
    let newUserId: string;
    try {
      const result = await auth.api.signUpEmail({
        body: { email: MIGRATED_EMAIL, password: MIGRATED_PASSWORD, name: "Migrated dev account" },
      });
      newUserId = result.user.id;
      console.log("Created new account:", newUserId);
    } catch (err) {
      // Already exists from a previous run of this script — look it up instead.
      const existing = await pool.query(`SELECT id FROM "user" WHERE email = $1`, [MIGRATED_EMAIL]);
      if (!existing.rows[0]) throw err;
      newUserId = existing.rows[0].id;
      console.log("Account already existed:", newUserId);
    }

    console.log("Repointing portfolios.owner_id to the real account...");
    await pool.query(`ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_owner_id_users_id_fk`);
    await pool.query(`ALTER TABLE portfolios ALTER COLUMN owner_id TYPE text`);
    await pool.query(`UPDATE portfolios SET owner_id = $1 WHERE owner_id = $2`, [newUserId, LEGACY_DEV_USER_ID]);
    await pool.query(
      `ALTER TABLE portfolios ADD CONSTRAINT portfolios_owner_id_user_id_fk FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE`
    );
    console.log(`\n✅ Migrated. Log in as ${MIGRATED_EMAIL} / ${MIGRATED_PASSWORD} to see the migrated portfolio(s).`);
    console.log("   Change that password immediately — it's a placeholder, not a secret.");
  } else {
    console.log("Legacy user existed but owned no portfolios — nothing to reassign.");
    // Still need the column type to end up matching the new schema even with no rows.
    await pool.query(`ALTER TABLE portfolios DROP CONSTRAINT IF EXISTS portfolios_owner_id_users_id_fk`);
    await pool.query(`ALTER TABLE portfolios ALTER COLUMN owner_id TYPE text`);
    await pool.query(
      `ALTER TABLE portfolios ADD CONSTRAINT portfolios_owner_id_user_id_fk FOREIGN KEY (owner_id) REFERENCES "user"(id) ON DELETE CASCADE`
    );
  }

  console.log("Dropping the retired 'users' table...");
  await pool.query(`DROP TABLE IF EXISTS users`);

  await pool.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
