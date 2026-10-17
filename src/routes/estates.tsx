import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ESTATES } from "@/lib/estates";

const title = "Paarl Wine Estates — Tasting Rooms, Grapes and Visits";
const description =
  "A guide to wine estates in Paarl and the surrounding Cape Winelands: what each farm grows, what the tasting room is like and how to visit.";

export const Route = createFileRoute("/estates")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/estates" },
      { property: "og:image", content: "https://app.paarlwine.com/og-guide.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Wine bottles from different countries laid out with grapes and vine leaves",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://app.paarlwine.com/og-guide.jpg" },
    ],
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/estates" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Paarl wine estates",
          itemListElement: ESTATES.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "Winery",
              name: e.name,
              address: { "@type": "PostalAddress", addressLocality: e.town, addressCountry: "ZA" },
              url: e.website,
            },
          })),
        }),
      },
    ],
  }),
  component: Estates,
});

function Estates() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Cape Winelands</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Paarl estates</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Paarl runs from the granite slopes of Paarl Mountain to the dry Paardeberg and across to
          the Simonsberg. Every corner tastes different. Here is where to start.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {ESTATES.map((estate) => (
            <article key={estate.name} className="surface-card flex flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-3xl">{estate.name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-gold">
                    <MapPin className="h-3 w-3" aria-hidden />
                    {estate.town}
                  </p>
                </div>
                {estate.sponsored && <Badge variant="secondary">Partner</Badge>}
              </div>

              <p className="mt-4 text-sm">{estate.blurb}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {estate.grapes.map((g) => (
                  <Badge key={g} variant="outline">
                    {g}
                  </Badge>
                ))}
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{estate.tasting}</p>

              {estate.website && (
                <a
                  href={estate.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex items-center gap-1.5 text-sm text-gold hover:underline"
                >
                  Visit website
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              )}
            </article>
          ))}
        </div>

        <div className="surface-card mt-12 p-8 text-center">
          <h2 className="text-3xl">Is your estate missing?</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            We list Paarl and Cape Winelands producers free of charge, and offer featured listings
            for estates who want their bottles inside the wine guide itself.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild variant="gold">
              <Link to="/contact">Get listed</Link>
            </Button>
            <Button asChild variant="cellar">
              <Link to="/sponsors">See partner options</Link>
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
