import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Grape, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  const { session } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <Grape className="h-5 w-5 text-gold" aria-hidden />
          <span className="text-display text-xl tracking-wide">Terroir</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          <Link
            to="/guide"
            className="rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Guide
          </Link>
          <Link
            to="/scan"
            className="rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            Scan
          </Link>
          <Link
            to="/estates"
            className="hidden rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            Estates
          </Link>
          <Link
            to="/about"
            className="hidden rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
          >
            About
          </Link>

          {session ? (
            <>
              <Link
                to="/cellar"
                className="rounded-md px-2.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                Cellar
              </Link>
              <Button variant="ghost" size="icon" aria-label="Sign out" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button asChild variant="gold" size="sm">
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
