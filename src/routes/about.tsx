import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Globe2, MapPin, Wine } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

const title = "About Terroir — The Wine Label Translator from Paarl";
const description =
  "Terroir is a Paarl-based wine app that reads any wine label, explains what is in the bottle and names the closest equivalents sold in your own country.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/about" },
      { property: "og:image", content: "https://app.paarlwine.com/og-default.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "A phone photographing a wine label in a candle-lit Paarl cellar",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://app.paarlwine.com/og-default.jpg" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Terroir — Paarl Wine",
          url: "https://app.paarlwine.com",
          logo: "https://app.paarlwine.com/og-default.jpg",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Paarl",
            addressRegion: "Western Cape",
            addressCountry: "ZA",
          },
        }),
      },
    ],
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/about" }],
  }),
  component: About,
});

function About() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">About</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Wine, translated</h1>
        <p className="mt-5 text-base text-muted-foreground">
          Terroir began with a simple frustration: a wine list in a foreign country tells you a
          village, a producer and a vintage — but almost never what the wine will actually taste
          like, or what to buy when you get home and want that feeling again.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Camera,
              title: "Photograph",
              body: "One picture of the label, taken in a shop, restaurant or tasting room.",
            },
            {
              icon: Wine,
              title: "Understand",
              body: "Grape, region, body, sweetness and tasting notes in plain language.",
            },
            {
              icon: Globe2,
              title: "Match",
              body: "Two or three bottles sold in your home country that drink the same way.",
            },
          ].map(({ icon: Icon, title: t, body }) => (
            <div key={t} className="surface-card p-5">
              <Icon className="h-5 w-5 text-gold" aria-hidden />
              <h2 className="mt-3 text-2xl">{t}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>

        <section className="mt-12 space-y-4">
          <h2 className="text-3xl">Based in Paarl</h2>
          <p className="text-sm text-muted-foreground">
            We sit in Paarl, in the Cape Winelands, about an hour from Cape Town. It is one of the
            oldest wine districts in the country and one of the most varied: dryland bush vine
            Chenin Blanc on the Paardeberg, Rhône reds on the granite slopes of Paarl Mountain, and
            cool Chardonnay on the Simonsberg side.
          </p>
          <p className="text-sm text-muted-foreground">
            That mix is exactly why the app exists. Visitors arrive knowing Sancerre or Rioja and
            leave without realising there is a Paarl bottle that scratches the same itch — and South
            Africans travelling abroad have the same problem in reverse.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-3xl">How the matching works</h2>
          <p className="text-sm text-muted-foreground">
            The app reads the label with image recognition, identifies the wine style behind it,
            then compares it against our reference guide of classic wines and their equivalents.
            Matches are based on grape, body, sweetness, acidity and oak — not on price or scores.
          </p>
          <p className="text-sm text-muted-foreground">
            It is a guide, not gospel. Vintages vary, producers vary, and a great winemaker can make
            a wine that breaks its own regional rules. Use it to narrow the shelf down from fifty
            bottles to three.
          </p>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-3xl">Your photos and data</h2>
          <p className="text-sm text-muted-foreground">
            Label photos are stored privately against your account and are visible only to you. Your
            saved cellar is yours; you can delete any scan at any time.
          </p>
        </section>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button asChild variant="gold" size="lg">
            <Link to="/scan">
              <Camera className="h-4 w-4" />
              Scan a label
            </Link>
          </Button>
          <Button asChild variant="cellar" size="lg">
            <Link to="/estates">
              <MapPin className="h-4 w-4" />
              Paarl estates
            </Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
