import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Camera, Trash2 } from "lucide-react";
import { listScans, deleteScan } from "@/lib/wine.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_authenticated/cellar")({
  head: () => ({
    meta: [
      { title: "My Cellar — Saved Wine Scans | Terroir" },
      {
        name: "description",
        content:
          "Every wine label you have scanned on your travels, with its grape, region and the equivalent bottle back home.",
      },
      { property: "og:title", content: "My Cellar — Saved Wine Scans" },
      {
        property: "og:description",
        content: "Your personal log of wines discovered abroad and their matches at home.",
      },
    ],
  }),
  component: CellarPage,
});

function CellarPage() {
  const fetchScans = useServerFn(listScans);
  const removeScan = useServerFn(deleteScan);
  const queryClient = useQueryClient();

  const { data: scans, isLoading } = useQuery({
    queryKey: ["scans"],
    queryFn: () => fetchScans(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => removeScan({ data: { id } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["scans"] });
      toast.success("Removed from your cellar.");
    },
    onError: () => toast.error("Could not remove that scan."),
  });

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl">My cellar</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you've scanned, kept for the next trip.
            </p>
          </div>
          <Button asChild variant="gold">
            <Link to="/scan">
              <Camera className="h-4 w-4" />
              Scan a label
            </Link>
          </Button>
        </div>

        {isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading your cellar…</p>}

        {!isLoading && (scans?.length ?? 0) === 0 && (
          <div className="surface-card mt-10 p-10 text-center">
            <h2 className="text-2xl">Nothing here yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Scan your first label and it will appear here with its home-country match.
            </p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          {scans?.map((scan) => (
            <article key={scan.id} className="surface-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {scan.country && (
                    <p className="text-xs uppercase tracking-[0.2em] text-gold">
                      {scan.country}
                      {scan.region ? ` · ${scan.region}` : ""}
                    </p>
                  )}
                  <h2 className="mt-1 text-2xl">{scan.wine_name}</h2>
                  {scan.producer && (
                    <p className="text-sm text-muted-foreground">{scan.producer}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${scan.wine_name}`}
                  onClick={() => deleteMutation.mutate(scan.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {scan.grape && <Badge variant="outline">{scan.grape}</Badge>}
                {scan.color && <Badge variant="outline">{scan.color}</Badge>}
              </div>

              {scan.summary && <p className="mt-4 text-sm">{scan.summary}</p>}

              {scan.equivalent_name && (
                <div className="mt-4 rounded-lg bg-secondary/60 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    In {scan.home_country}
                  </p>
                  <p className="mt-1 text-base font-medium">{scan.equivalent_name}</p>
                  {scan.equivalent_note && (
                    <p className="mt-1 text-sm text-muted-foreground">{scan.equivalent_note}</p>
                  )}
                </div>
              )}

              <p className="mt-4 text-xs text-muted-foreground">
                Scanned {new Date(scan.created_at).toLocaleDateString()}
              </p>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
