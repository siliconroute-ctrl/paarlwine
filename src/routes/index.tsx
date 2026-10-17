import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Camera, BookOpen, Globe2, Wine } from "lucide-react";
import { listWines } from "@/lib/wine.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-cellar.jpg";

const winesQuery = queryOptions({
  queryKey: ["wines"],
  queryFn: () => listWines(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Terroir — Translate Any Wine Label While Travelling" },
      {
        name: "description",
        content:
          "Photograph a foreign wine label and Terroir tells you the grape, the style and which bottles back home taste closest.",
      },
      { property: "og:title", content: "Terroir — Translate Any Wine Label While Travelling" },
      {
        property: "og:description",
        content: "Photograph a foreign wine label and Terroir tells you the grape, the style and which bottles back home taste closest.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/" },
      { property: "og:image", content: "https://app.paarlwine.com/og-default.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "A phone photographing a wine label in a candle-lit Paarl cellar" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Terroir — Translate Any Wine Label While Travelling" },
      {
        name: "twitter:description",
        content: "Photograph a foreign wine label and Terroir tells you the grape, the style and which bottles back home taste closest.",
      },
      { name: "twitter:image", content: "https://app.paarlwine.com/og-default.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/" }],

  }),

  loader: ({ context }) => context.queryClient.ensureQueryData(winesQuery),
  component: Index,
});

function Index() {
  const { data: wines } = useSuspenseQuery(winesQuery);
  const featured = wines.slice(0, 6);
  const countries = new Set(wines.map((w) => w.country)).size;

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <img
            src={heroImage}
            alt="Bottles of wine resting in a dim stone cellar"
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
          <div className="relative mx-auto max-w-5xl px-4 py-20 md:py-28">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">
              A translator for the wine list
            </p>
            <h1 className="mt-5 max-w-2xl text-5xl leading-[1.05] md:text-7xl">
              What is this bottle, and what do I buy back home?
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
              European labels name a village, not a grape. Photograph any label abroad and Terroir
              tells you what is in the bottle — then names the wines on your own shelves that taste
              closest.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg" variant="gold">
                <Link to="/scan">
                  <Camera className="h-4 w-4" />
                  Scan a label
                </Link>
              </Button>
              <Button asChild size="lg" variant="cellar">
                <Link to="/guide">
                  <BookOpen className="h-4 w-4" />
                  Browse the guide
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Photograph the label",
                body: "In a shop, a trattoria or a tasting room — one photo is enough.",
              },
              {
                icon: Wine,
                title: "See what it really is",
                body: "Grape, region, body, sweetness and how it will taste, in plain language.",
              },
              {
                icon: Globe2,
                title: "Find it back home",
                body: "Two or three bottles sold in your country that drink the same way.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="surface-card p-6">
                <Icon className="h-5 w-5 text-gold" aria-hidden />
                <h2 className="mt-4 text-2xl">{title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl">In the guide</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {wines.length} classic wines across {countries} countries, each with its
                home-shelf equivalents.
              </p>
            </div>
            <Link to="/guide" className="shrink-0 text-sm text-gold hover:underline">
              See all
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((wine) => (
              <article key={wine.id} className="surface-card p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-gold">{wine.country}</p>
                <h3 className="mt-2 text-2xl">{wine.name}</h3>
                <p className="text-sm text-muted-foreground">{wine.grape}</p>
                <p className="mt-3 text-sm text-muted-foreground">{wine.tasting_notes}</p>
                {wine.equivalents.length > 0 && (
                  <p className="mt-4 border-t border-border pt-3 text-sm">
                    <span className="text-muted-foreground">Tastes like: </span>
                    {wine.equivalents.slice(0, 2).join(", ")}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />

    </div>
  );
}
