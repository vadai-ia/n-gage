import GuestNav from "@/components/event/GuestNav";
import ViewSwitcher from "@/components/admin/ViewSwitcher";

export default function GuestEventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#07070F", paddingBottom: "calc(70px + env(safe-area-inset-bottom, 0px))" }}>
      <ViewSwitcher />
      {children}
      <GuestNav />
    </div>
  );
}
