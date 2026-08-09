import { notFound } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import MovementForm from "../MovementForm";
import { prisma } from "@/lib/prisma";
import { getMovement } from "@/lib/movements";

export const dynamic = "force-dynamic";

export default async function EditMovementPage({ params }: { params: { id: string } }) {
  const [movement, accounts] = await Promise.all([
    getMovement(params.id),
    prisma.account.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!movement) notFound();

  return (
    <>
      <BackLink href="/movements" label="Volver a movimientos" />
      <PageHeader eyebrow="Registro" title="Editar movimiento" />
      <MovementForm accounts={accounts} initial={movement} />
    </>
  );
}
