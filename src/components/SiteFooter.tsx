import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/60">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 text-sm md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <p className="text-display text-lg tracking-wide">Terroir</p>
          <p className="mt-2 text-xs text-muted-foreground">
            The wine label translator from Paarl, South Africa. Part of{" "}
            <a href="https://paarlwine.com" className="text-gold hover:underline" rel="noopener">
              paarlwine.com
            </a>
            .
          </p>
        </div>

        <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-xs">
          <Link to="/guide" className="text-muted-foreground hover:text-foreground">
            Wine guide
          </Link>
          <Link to="/estates" className="text-muted-foreground hover:text-foreground">
            Paarl estates
          </Link>
          <Link to="/about" className="text-muted-foreground hover:text-foreground">
            About
          </Link>
          <Link to="/sponsors" className="text-muted-foreground hover:text-foreground">
            Advertise
          </Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">
            Contact
          </Link>
          <a
            href="https://paarlwine.com"
            className="text-muted-foreground hover:text-foreground"
            rel="noopener"
          >
            Wine articles
          </a>
        </nav>
      </div>

      <p className="border-t border-border/50 px-4 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Paarl Wine. Photos you upload stay private to your account.
        Enjoy responsibly — not for under 18s.
      </p>
    </footer>
  );
}
