import { BottomNav } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <Sidebar />
      <main className="flex flex-1 flex-col pb-20 md:pb-0">{children}</main>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
