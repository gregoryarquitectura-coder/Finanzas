import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import MovementForm from "../MovementForm";
import { prisma } from "@/lib/prisma";
import { isValidDateStr } from "@/lib/dates";
import { CATEGORIAS, TIPOS_LIST, type MovementType } from "@/config/finance.config";

export const dynamic = "force-dynamic";

export default async function NewMovementPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const accounts = await prisma.account.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  const type = TIPOS_LIST.includes(searchParams.type as MovementType)
    ? (searchParams.type as MovementType)
    : undefined;
  const category = (CATEGORIAS as readonly string[]).includes(searchParams.category ?? "")
    ? searchParams.category
    : undefined;
  const date = isValidDateStr(searchParams.date) ? searchParams.date : undefined;
  const amountNum = Number(searchParams.amount);
  const amount = searchParams.amount && Number.isFinite(amountNum) ? Math.round(amountNum) : undefined;
  const description = searchParams.description || undefined;
  const fromScan = searchParams.scanned === "1";

  const hasPrefill = type || category || date || amount != null || description;

  return (
    <>
      <BackLink href="/movements" label="Volver a movimientos" />
      <PageHeader eyebrow="Registro" title="Nuevo movimiento" />
      <MovementForm
        accounts={accounts}
        prefill={hasPrefill ? { type, category, date, amount, description } : undefined}
        fromScan={fromScan}
      />
    </>
  );
}
