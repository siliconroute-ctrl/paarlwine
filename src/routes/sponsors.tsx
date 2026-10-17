import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Megaphone, Newspaper, Wine } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";

const title = "Advertise With Us — Wine Estate Partnerships | Paarl Wine";
const description =
  "Put your Paarl wine estate in front of visitors who are choosing what to taste and what to take home. Estate listings, featured bottles and sponsored articles.";

export const Route = createFileRoute("/sponsors")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/sponsors" },
      { property: "og:image", content: "https://app.paarlwine.com/og-guide.jpg" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Wine bottles from different countries laid out with grapes and vine leaves" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: "https://app.paarlwine.com/og-guide.jpg" },

    ],
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/sponsors" }],
  }),
  component: Sponsors,
});

const packages = [
  {
    icon: BadgeCheck,
    name: "Estate listing",
    price: "Free",
    body: "Your name, region, grapes and tasting-room details in the Paarl estates directory, with a link to your own site.",
    points: ["Directory entry", "Outbound link", "Kept up to date on request"],
  },
  {
    icon: Wine,
    name: "Featured bottles",
    price: "Monthly",
    body: "Your wines added to the searchable guide so travellers matching a Sancerre or a Rioja are shown your bottle as the local equivalent.",
    points: [
      "Up to 5 wines in the guide",
      "Partner badge on your estate card",
      "Priority placement in search results",
    ],
  },
  {
    icon: Newspaper,
    name: "Sponsored article",
    price: "Per piece",
    body: "A written feature on paarlwine.com about your estate, harvest, new release or events — shared from the app and the directory.",
    points: ["Original written feature", "Photography included", "Permanent link from your listing"],
  },
];

function Sponsors() {
  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-4 py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Partner with us</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Reach people deciding what to drink</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Paarl Wine is read by two audiences at the same moment of intent: visitors planning a
          Cape Winelands tasting, and wine drinkers standing in front of a shelf trying to work out
          what to buy. Both are one click from your estate.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {packages.map(({ icon: Icon, name, price, body, points }) => (
            <article key={name} className="surface-card flex flex-col p-6">
              <Icon className="h-5 w-5 text-gold" aria-hidden />
              <h2 className="mt-4 text-2xl">{name}</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{price}</p>
              <p className="mt-3 text-sm">{body}</p>
              <ul className="mt-4 space-y-1.5 text-sm text-muted-foreground">
                {points.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <section className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            { stat: "Paarl-based", label: "Written from the district, not from a desk abroad" },
            { stat: "Two channels", label: "The article site plus the wine app on this subdomain" },
            { stat: "Intent traffic", label: "Visitors searching for tastings, grapes and pairings" },
          ].map((item) => (
            <div key={item.stat} className="surface-card p-6">
              <p className="text-2xl text-gold">{item.stat}</p>
              <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </section>

        <div className="surface-card mt-12 p-8 text-center">
          <Megaphone className="mx-auto h-6 w-6 text-gold" aria-hidden />
          <h2 className="mt-4 text-3xl">Talk to us about rates</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Tell us about your estate and what you would like to promote. We reply with current
            rates and available slots.
          </p>
          <Button asChild variant="gold" size="lg" className="mt-6">
            <Link to="/contact">Enquire now</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
