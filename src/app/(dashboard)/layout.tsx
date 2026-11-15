import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";
import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-col md:flex-row">
      <Sidebar />
      <div className="flex flex-1 flex-col pb-20 md:pb-0">
        <MobileHeader />
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
      <div className="md:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
