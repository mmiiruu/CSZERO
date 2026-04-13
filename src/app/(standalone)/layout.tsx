/**
 * Standalone layout — no Navbar, no Footer.
 * Pages under (standalone)/ render in the root <html>/<body> context
 * (fonts, theme script) but without the site chrome.
 */
export default function StandaloneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
