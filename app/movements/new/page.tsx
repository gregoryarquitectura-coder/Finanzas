import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import MovementForm from "../MovementForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NewMovementPage() {
  const accounts = await prisma.account.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <>
      <BackLink href="/movements" label="Volver a movimientos" />
      <PageHeader eyebrow="Registro" title="Nuevo movimiento" />
      <MovementForm accounts={accounts} />
    </>
  );
}
