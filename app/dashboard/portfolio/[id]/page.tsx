import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getPortfolio } from "@/lib/db/portfolios";
import { LoadPortfolioIntoEditor } from "@/features/generator/load-portfolio-into-editor";

export const dynamic = "force-dynamic";

export default async function EditPortfolioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser(`/dashboard/portfolio/${id}`);

  // getPortfolio returns null for both "doesn't exist" and "belongs to
  // someone else" — deliberately indistinguishable to the caller, so a 404
  // never leaks whether a given id exists.
  const portfolio = await getPortfolio(id, user.id);
  if (!portfolio) notFound();

  return <LoadPortfolioIntoEditor portfolio={portfolio} />;
}
