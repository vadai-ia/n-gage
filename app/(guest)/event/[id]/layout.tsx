import GuestNav from "@/components/event/GuestNav";

export default function GuestEventLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen pb-20" style={{ background: "#0A0A0F" }}>
      {children}
      <GuestNav />
    </div>
  );
}
