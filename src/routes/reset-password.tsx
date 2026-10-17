import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grape } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Terroir Wine Translator" },
      {
        name: "description",
        content:
          "Choose a new password for your Terroir account and get back to scanning wine labels.",
      },
      { property: "og:title", content: "Reset your password — Terroir" },
      {
        property: "og:description",
        content: "Choose a new password for your Terroir account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ResetPasswordPage,
});

type Status = "checking" | "ready" | "invalid";

function ResetPasswordPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || session) setStatus("ready");
    });

    // Give supabase-js a moment to parse the recovery link from the URL.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setStatus(data.session ? "ready" : "invalid");
    }, 1200);

    return () => {
      active = false;
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Those passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated — you're signed in.");
      navigate({ to: "/scan", replace: true });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your password.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2">
          <Grape className="h-5 w-5 text-gold" aria-hidden />
          <span className="text-display text-2xl">Terroir</span>
        </Link>

        <div className="surface-card mt-8 p-7">
          {status === "checking" && (
            <p className="text-sm text-muted-foreground">Checking your reset link…</p>
          )}

          {status === "invalid" && (
            <>
              <h1 className="text-3xl">Link expired</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                This password reset link is invalid or has already been used. Request a fresh one
                and it will land in your inbox within a minute.
              </p>
              <Button asChild variant="gold" className="mt-6 w-full">
                <Link to="/auth">Request a new link</Link>
              </Button>
            </>
          )}

          {status === "ready" && (
            <>
              <h1 className="text-3xl">Set a new password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Pick something at least 6 characters long.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                  {busy ? "Saving…" : "Update password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
