import { AppNav } from "@/components/AppNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppNav />
      {/* Room for the fixed bottom bar on phones */}
      <div className="pb-[calc(3.5rem+env(safe-area-inset-bottom))] md:pb-0">
        {children}
      </div>
    </>
  );
}
