import PageHeader from "@/components/PageHeader";
import NavBar from "@/components/NavBar";
import MovementsView from "./MovementsView";
import { getMovements } from "@/lib/movements";

export const dynamic = "force-dynamic";

export default async function MovementsPage() {
  const movements = await getMovements();

  return (
    <>
      <PageHeader eyebrow="Registro" title="Movimientos" subtitle="Todo lo que entra y sale, en un solo lugar." />
      <MovementsView movements={movements} />
      <NavBar />
    </>
  );
}
