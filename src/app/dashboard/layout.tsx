export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-gray-50">
      {/* Container principal do Dashboard */}
      {children}
    </section>
  );
}