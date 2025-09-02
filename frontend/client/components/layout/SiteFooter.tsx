export default function SiteFooter() {
  return (
    <footer className="border-t bg-background/80">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 py-8 md:h-20 md:flex-row">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SafeScope. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/about" className="hover:text-foreground">
            About
          </a>
          <a href="/forum" className="hover:text-foreground">
            Community
          </a>
          <a href="/risk-report" className="hover:text-foreground">
            Risk Reports
          </a>
        </div>
      </div>
    </footer>
  );
}
