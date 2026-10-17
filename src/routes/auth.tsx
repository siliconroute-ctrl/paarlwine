import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grape } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Terroir Wine Translator" },
      {
        name: "description",
        content:
          "Sign in to Terroir to scan wine labels abroad and keep a personal cellar of everything you have tasted.",
      },
      { property: "og:title", content: "Sign in — Terroir Wine Translator" },
      {
        property: "og:description",
        content: "Save your label scans and tasting notes across every trip.",
      },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();
  const { session, loading } = useSession();

  useEffect(() => {
    if (!loading && session) navigate({ to: "/scan", replace: true });
  }, [session, loading, navigate]);

  function friendlyError(message: string) {
    if (/invalid login credentials/i.test(message)) {
      return "Email or password is incorrect — use “Forgot password?” to reset it.";
    }
    if (/email not confirmed/i.test(message)) {
      return "That email hasn't been confirmed yet. Use “Forgot password?” — setting a new password will also confirm your account.";
    }
    return message;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Account created — you're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/scan", replace: true });
    } catch (err) {
      toast.error(friendlyError(err instanceof Error ? err.message : "Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
    } catch {
      // Deliberately silent: never reveal whether an email is registered.
    } finally {
      setSent(true);
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/scan` },
    });
    if (error) {
      setBusy(false);
      toast.error("Google sign-in failed. Try again.");
    }
    // On success the browser is redirected to Google, so there is nothing else to do here.
  }

  if (mode === "forgot") {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="flex items-center justify-center gap-2">
            <Grape className="h-5 w-5 text-gold" aria-hidden />
            <span className="text-display text-2xl">Terroir</span>
          </Link>

          <div className="surface-card mt-8 p-7">
            <h1 className="text-3xl">Reset your password</h1>
            {sent ? (
              <p className="mt-3 text-sm text-muted-foreground">
                If that email has an account, a reset link is on its way. Check your inbox (and
                spam folder) — the link opens a page where you can set a new password.
              </p>
            ) : (
              <>
                <p className="mt-2 text-sm text-muted-foreground">
                  Enter your email and we'll send you a link to set a new password.
                </p>
                <form onSubmit={handleReset} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="gold" className="w-full" disabled={busy}>
                    {busy ? "Sending…" : "Send reset link"}
                  </Button>
                </form>
              </>
            )}

            <button
              type="button"
              className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSent(false);
                setMode("signin");
              }}
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2">
          <Grape className="h-5 w-5 text-gold" aria-hidden />
          <span className="text-display text-2xl">Terroir</span>
        </Link>

        <div className="surface-card mt-8 p-7">
          <h1 className="text-3xl">{mode === "signin" ? "Welcome back" : "Create your cellar"}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Scans and tasting notes are saved to your account, on every device.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === "signin" && (
                  <button
                    type="button"
                    className="text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    onClick={() => {
                      setSent(false);
                      setMode("forgot");
                    }}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" variant="gold" className="w-full" disabled={busy}>
              {mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="cellar" className="w-full" onClick={handleGoogle} disabled={busy}>
            Continue with Google
          </Button>

          <button
            type="button"
            className="mt-6 w-full text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin"
              ? "New here? Create an account"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
