import PageHeader from "@/components/PageHeader";
import BackLink from "@/components/BackLink";
import ScanReceiptView from "./ScanReceiptView";

export default function ScanReceiptPage() {
  return (
    <>
      <BackLink href="/movements" label="Volver a movimientos" />
      <PageHeader
        eyebrow="Carga rápida"
        title="Escanear boleta"
        subtitle="Saca una foto o sube una captura — la IA lee el monto y te arma el movimiento."
      />
      <ScanReceiptView />
    </>
  );
}
