import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { ForestBackdrop } from "@/components/ForestBackdrop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Breadcrumb — leave a trail for your future self" },
      {
        name: "description",
        content:
          "A warm, gentle habit journal for ADHD brains. Drop crumbs, follow the trail.",
      },
      { property: "og:title", content: "Breadcrumb" },
      {
        property: "og:description",
        content: "Leave a trail for your future self.",
      },
    ],
  }),
  component: WelcomePage,
});

function WelcomePage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/journal", replace: true });
    });
  }, [navigate]);

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your email to finish setting up");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/journal", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't sign in — try again");
    } finally {
      setPending(false);
    }
  }

  async function handleGoogle() {
    setPending(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (result.error) {
        toast.error("Couldn't connect to Google — try again");
        setPending(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: "/journal", replace: true });
    } catch {
      toast.error("Couldn't connect to Google — try again");
      setPending(false);
    }
  }

  return (
    <ForestBackdrop variant="deep">
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center">
            <h1 className="font-display text-5xl tracking-tight text-foreground">
              Breadcrumb
            </h1>
            <p className="mt-3 text-base italic text-muted-foreground">
              leave a trail for your future self
            </p>
          </div>

          <div className="soft-card ember-glow rounded-3xl p-7">
            <form onSubmit={handleEmail} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-normal text-muted-foreground">
                  email
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-border/60 bg-background/40"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-normal text-muted-foreground">
                  password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-border/60 bg-background/40"
                />
              </div>
              <Button
                type="submit"
                disabled={pending}
                className="h-11 w-full rounded-xl bg-primary text-primary-foreground hover:opacity-90"
              >
                {pending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : mode === "signup" ? (
                  "create your trail"
                ) : (
                  "step into the woods"
                )}
              </Button>
            </form>

            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogle}
              disabled={pending}
              className="h-11 w-full rounded-xl border-border/60 bg-background/30 hover:bg-background/60"
            >
              <GoogleMark />
              continue with google
            </Button>

            <button
              type="button"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              className="mt-5 block w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              {mode === "signin"
                ? "first time here? create an account"
                : "already have an account? sign in"}
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground/70">🐾</p>
        </div>
      </main>
    </ForestBackdrop>
  );
}

function GoogleMark() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"/>
    </svg>
  );
}
