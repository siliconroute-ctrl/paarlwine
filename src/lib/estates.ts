export interface Estate {
  name: string;
  town: string;
  blurb: string;
  grapes: string[];
  tasting: string;
  website?: string;
  sponsored?: boolean;
}

/**
 * Curated directory of Paarl and Cape Winelands estates.
 * Edit this list directly — it moves to the database once sponsorships are live.
 */
export const ESTATES: Estate[] = [
  {
    name: "Fairview",
    town: "Suider-Paarl",
    blurb:
      "Wine and cheese under one roof on the slopes of Paarl Mountain, and the estate that made Rhône varieties a Paarl habit.",
    grapes: ["Shiraz", "Viognier", "Chenin Blanc", "Mourvèdre"],
    tasting: "Daily tastings with cheese pairings; goat tower on site.",
    website: "https://www.fairview.co.za",
  },
  {
    name: "Nederburg",
    town: "Paarl",
    blurb:
      "One of South Africa's most recognised names, with a Cape Dutch manor house and a deep back catalogue of noble late harvest wines.",
    grapes: ["Cabernet Sauvignon", "Chenin Blanc", "Chardonnay"],
    tasting: "Manor house tastings, picnics in summer.",
    website: "https://www.nederburg.com",
  },
  {
    name: "Glen Carlou",
    town: "Klapmuts, Paarl",
    blurb:
      "Chardonnay specialist on the Simonsberg side of Paarl, with a contemporary art gallery and long valley views.",
    grapes: ["Chardonnay", "Cabernet Sauvignon", "Merlot"],
    tasting: "Restaurant and gallery, tastings by walk-in.",
    website: "https://www.glencarlou.co.za",
  },
  {
    name: "Vondeling",
    town: "Voor-Paardeberg, Paarl",
    blurb:
      "Windswept Paardeberg slopes producing tight, mineral whites and elegant Rhône-style reds, with a restored chapel on the hill.",
    grapes: ["Chenin Blanc", "Grenache", "Shiraz", "Viognier"],
    tasting: "Tastings by appointment; chapel viewpoint walk.",
    website: "https://www.vondelingwines.co.za",
  },
  {
    name: "Rhebokskloof",
    town: "Northern Paarl",
    blurb:
      "A natural amphitheatre on the north face of Paarl Mountain, known for its Shiraz and its long lunch culture.",
    grapes: ["Shiraz", "Chardonnay", "Pinotage"],
    tasting: "Two restaurants, picnics, mountain bike trails.",
    website: "https://www.rhebokskloof.co.za",
  },
  {
    name: "Backsberg",
    town: "Simondium, Paarl",
    blurb:
      "A family estate at the foot of the Simonsberg with a long-running commitment to carbon-neutral farming.",
    grapes: ["Cabernet Sauvignon", "Chardonnay", "Pinotage"],
    tasting: "Garden restaurant, braai facilities for visitors.",
    website: "https://www.backsberg.co.za",
  },
  {
    name: "Babylonstoren",
    town: "Simondium, Paarl",
    blurb:
      "Farm, garden and cellar in one: eight hectares of formal garden alongside a modern winery and two restaurants.",
    grapes: ["Chenin Blanc", "Mourvèdre", "Shiraz", "Viognier"],
    tasting: "Booking essential; garden tours daily.",
    website: "https://www.babylonstoren.com",
  },
  {
    name: "Avondale",
    town: "Klein Drakenstein, Paarl",
    blurb:
      "Certified organic and biodynamic farming, with ducks instead of pesticides and famously precise Chenin and Cabernet Franc.",
    grapes: ["Chenin Blanc", "Cabernet Franc", "Shiraz"],
    tasting: "Eco wine safari tours by appointment.",
    website: "https://www.avondalewine.co.za",
  },
  {
    name: "Landskroon",
    town: "Suider-Paarl",
    blurb:
      "Seven generations of the de Villiers family, still making honest, well-priced Paarl reds and a rare Cape port style.",
    grapes: ["Cabernet Sauvignon", "Shiraz", "Tinta Barocca"],
    tasting: "Relaxed cellar door with terrace lunches.",
    website: "https://www.landskroonwines.com",
  },
  {
    name: "Laborie",
    town: "Paarl town",
    blurb:
      "A walk from Paarl's main street, this Cape Dutch homestead is the easiest first stop for visitors without a car.",
    grapes: ["Chardonnay", "Pinot Noir", "Shiraz"],
    tasting: "Cap Classique focus; in-town location.",
    website: "https://www.laboriewines.co.za",
  },
  {
    name: "Anura",
    town: "Simondium, Paarl",
    blurb:
      "A wide, unfussy range plus an on-site cheesery and brewery — a good stop for a mixed group.",
    grapes: ["Chenin Blanc", "Merlot", "Petit Verdot"],
    tasting: "Cheese, beer and wine flights side by side.",
    website: "https://www.anura.co.za",
  },
  {
    name: "Perdeberg",
    town: "Voor-Paardeberg, Paarl",
    blurb:
      "Dryland bush vine Chenin Blanc is the house speciality, from some of the oldest vineyards in the district.",
    grapes: ["Chenin Blanc", "Shiraz", "Cabernet Sauvignon"],
    tasting: "Cellar door tastings, dryland vineyard walks.",
    website: "https://www.perdeberg.co.za",
  },
];
