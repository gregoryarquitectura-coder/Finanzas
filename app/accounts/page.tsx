import PageHeader from "@/components/PageHeader";
import NavBar from "@/components/NavBar";
import AccountsView from "./AccountsView";
import { getAccountBalances } from "@/lib/accounts";

export const dynamic = "force-dynamic";

export default async function AccountsPage() {
  const accounts = await getAccountBalances();

  return (
    <>
      <PageHeader
        eyebrow="Configuración"
        title="Cuentas"
        subtitle="Ajusta el saldo inicial cuando reconcilies con tu banco."
      />
      <AccountsView accounts={accounts} />
      <NavBar />
    </>
  );
}
