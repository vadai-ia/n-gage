import GuestNav from "@/components/event/GuestNav";
import ViewSwitcher from "@/components/admin/ViewSwitcher";
import RealtimeNotifications from "@/components/event/RealtimeNotifications";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";

export default async function GuestEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <NotificationProvider>
      <div className="min-h-screen" style={{ background: "#07070F", paddingBottom: "calc(70px + env(safe-area-inset-bottom, 0px))" }}>
        <ViewSwitcher />
        <RealtimeNotifications eventId={id} />
        {children}
        <GuestNav />
      </div>
    </NotificationProvider>
  );
}
