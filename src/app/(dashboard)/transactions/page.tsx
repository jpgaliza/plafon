import { useTranslations } from "next-intl";
import { Receipt } from "lucide-react";

export default function TransactionsPage() {
  const t = useTranslations("Transactions");

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>

      {/* Empty state — will be populated in Step 5 */}
      <div className="mt-16 flex flex-col items-center gap-3 text-muted-foreground">
        <Receipt className="h-12 w-12 opacity-30" />
        <p className="text-sm">{t("noTransactions")}</p>
      </div>
    </div>
  );
}
