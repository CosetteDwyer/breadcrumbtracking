import { Link, useNavigate } from "@tanstack/react-router";
import { NotebookPen, Footprints, LogOut, Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

export function BottomNav() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/", replace: true });
  }

  return (
    <nav className="sticky bottom-0 z-20 mx-auto mt-12 w-full max-w-xl px-4 pb-6 pt-2">
      <div className="soft-card flex items-center justify-between rounded-full px-2 py-2">
        <div className="flex items-center gap-1">
          <Link
            to="/journal"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-foreground"
            activeProps={{ className: "bg-accent text-foreground" }}
          >
            <NotebookPen className="h-4 w-4" />
            Journal
          </Link>
          <Link
            to="/trail"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-foreground"
            activeProps={{ className: "bg-accent text-foreground" }}
          >
            <Footprints className="h-4 w-4" />
            Trail
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors data-[status=active]:bg-accent data-[status=active]:text-foreground"
            activeProps={{ className: "bg-accent text-foreground" }}
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Link>
        </div>
        <button
          onClick={signOut}
          aria-label="Sign out"
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
      <div className="mt-3 text-center text-xs text-muted-foreground/60">🐾</div>
    </nav>
  );
}
