import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import NavBar from "@/components/NavBar";
import StatCard from "@/components/StatCard";
import AlertBanner from "@/components/AlertBanner";
import MonthTrendChart from "@/components/MonthTrendChart";
import CategoryBarList from "@/components/CategoryBarList";
import MonthSelect from "./MonthSelect";
import { getDashboardData } from "@/lib/dashboard";
import { formatCLP } from "@/lib/balances";
import { currentMonthStr } from "@/lib/dates";
import { CURRENCY_LOCALE } from "@/config/finance.config";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const month = searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)
    ? searchParams.month
    : currentMonthStr();
  const data = await getDashboardData(month);
  const fmt = (n: number) => formatCLP(n, CURRENCY_LOCALE);

  return (
    <>
      <PageHeader
        eyebrow="Flujo de caja"
        title="Dashboard"
        action={<MonthSelect month={data.month} options={data.availableMonths} />}
      />

      <AlertBanner level={data.alert.level} message={data.alert.message} />

      <div className="space-y-6">
        <div className="panel p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Ingresos del mes" value={fmt(data.ingresos)} />
            <StatCard label="Gastos del mes" value={fmt(data.gastos)} />
            <StatCard label="Flujo neto del mes" value={fmt(data.flujoNeto)} negative={data.flujoNeto < 0} />
            <StatCard label="Saldo total" value={fmt(data.saldoTotal)} />
          </div>
        </div>

        <div className="panel p-4">
          <p className="label-caps mb-3">Saldo por cuenta</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {data.accountBalances.map((a) => (
              <StatCard key={a.id} label={a.name} value={fmt(a.balance)} />
            ))}
          </div>
        </div>

        <div className="panel p-4">
          <p className="label-caps mb-3">Neto por línea de negocio</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Object.values(data.businessLines).map((l) => (
              <StatCard
                key={l.key}
                label={l.label}
                value={fmt(l.ingresos - l.gastos)}
                negative={l.ingresos - l.gastos < 0}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <MonthTrendChart trend={data.trend} />
          <CategoryBarList items={data.categoryBreakdown} />
        </div>

        <Link href="/movements/new" className="btn-primary block text-center">
          + Registrar movimiento
        </Link>
      </div>

      <NavBar />
    </>
  );
}
