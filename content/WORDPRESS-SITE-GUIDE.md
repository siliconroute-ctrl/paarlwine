# paarlwine.com — site structure and menu guide

The setup: **paarlwine.com** is WordPress (OceanWP) for articles and evergreen
content. **app.paarlwine.com** is the Terroir wine app built here — the label
scanner, the searchable wine guide, the estate directory and user accounts.

---

## Primary menu (WordPress)

```
Home · Paarl Wines · Estates · Visit & Taste · Articles · Wine App · Advertise · Contact
```

| Menu item        | Type            | What goes in it |
|------------------|-----------------|-----------------|
| **Home**         | Page            | Hero, what the site is, three featured articles, link to the app, sponsor strip |
| **Paarl Wines**  | Category/parent | Evergreen explainers: the region, the grapes, reading labels, pairing |
| **Estates**      | Category/parent | One page per estate; sponsored estates get a fuller page |
| **Visit & Taste**| Category/parent | Itineraries, tasting-room practicalities, seasons, events |
| **Articles**     | Blog index      | News, harvest updates, new releases, estate submissions |
| **Wine App**     | External link   | `https://app.paarlwine.com` — set to open in a new tab |
| **Advertise**    | Page            | Sponsor packages and rates for estates |
| **Contact**      | Page            | Form, email, location |

### Suggested sub-menu items

- **Paarl Wines** → Beginner's Guide · Signature Grapes · Reading a Label · Food Pairing
- **Estates** → Estate Directory · Submit Your Estate
- **Visit & Taste** → One-Day Route · Weekend Route · Visitor Tips

### Footer menu

```
About · Advertise · Contact · Privacy Policy · Terms · Wine App
```

Add a legal line: *Enjoy responsibly. Not for persons under 18.*

---

## Starter articles

Eight articles are in `content/articles/`, ready to paste into WordPress. Each
file has front matter with the **title**, **slug**, **meta description** and
**category** — copy those into your SEO plugin (Yoast or Rank Math) when you
publish.

| # | Article | Category |
|---|---------|----------|
| 1 | A Beginner's Guide to Paarl Wine | Paarl Wines |
| 2 | Paarl's Signature Grapes | Paarl Wines |
| 3 | 12 Paarl Wine Estates Worth Visiting | Estates |
| 4 | How to Read a South African Wine Label | Paarl Wines |
| 5 | What Overseas Visitors Should Know Before a Cape Winelands Tasting | Visit & Taste |
| 6 | If You Like Sancerre, Rioja or Chablis — Drink This From Paarl | Paarl Wines |
| 7 | Food and Wine Pairing the Cape Way | Visit & Taste |
| 8 | Wine Tourism in Paarl: A One-Day and a Weekend Itinerary | Visit & Taste |

Every article closes with a call-to-action linking to the app, so the WordPress
site feeds traffic into `app.paarlwine.com`.

### Publishing order

Publish 1, 3 and 5 first — they are the strongest search targets ("Paarl wine",
"Paarl wine estates", "Cape Winelands tasting"). Then release the rest weekly so
the site looks alive to both readers and search engines.

---

## When estates start sending content

Estate submissions belong in **Articles**, tagged with the estate name and
cross-linked from that estate's page under **Estates**. Ask each estate for:

- 300–600 words
- Three landscape photos, 1600px wide or larger
- Their logo
- The single wine they want highlighted

Mark paid placements clearly (a "Sponsored" label). It keeps you compliant and
readers trust the unpaid content more because of it.

---

## Connecting the subdomain

1. Publish this project from Lovable.
2. Project Settings → Domains → Connect domain → enter `app.paarlwine.com`.
3. At your DNS host, add an **A record** for `app` pointing to `185.158.133.1`,
   plus the TXT verification record Lovable shows you.
4. Wait for verification and SSL (usually under an hour, up to 72 hours).

Your WordPress install on the root domain is untouched by any of this.

---

## Cross-linking checklist

- WordPress menu: **Wine App** → `https://app.paarlwine.com`
- WordPress home page: a banner or block promoting the label scanner
- Every article: closing call-to-action to the app (already written in)
- App footer: links back to `paarlwine.com` and to the articles (already built)
- App estate pages: link to each estate's own website
