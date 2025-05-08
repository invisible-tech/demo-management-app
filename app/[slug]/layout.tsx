export default function CloakedDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is intentionally minimal to not interfere with the proxied content
  return <>{children}</>;
} 