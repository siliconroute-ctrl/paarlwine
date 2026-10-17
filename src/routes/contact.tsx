import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, MapPin, Send } from "lucide-react";
import { toast } from "sonner";
import { submitContactMessage } from "@/lib/contact.functions";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const title = "Contact Paarl Wine — Estates, Listings and Enquiries";
const description =
  "Get in touch with Paarl Wine about estate listings, sponsored features, corrections to the wine guide or anything else.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://app.paarlwine.com/contact" },
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
    links: [{ rel: "canonical", href: "https://app.paarlwine.com/contact" }],
  }),
  component: Contact,
});

function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isEstate, setIsEstate] = useState(false);
  const [estateName, setEstateName] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in your name, email and message.");
      return;
    }
    setSending(true);
    try {
      await submitContactMessage({
        data: {
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          isEstate,
          estateName: isEstate && estateName.trim() ? estateName.trim() : null,
        },
      });
    } catch {
      setSending(false);
      toast.error("That didn't send. Please try again.");
      return;
    }
    setSending(false);

    setSent(true);
    setName("");
    setEmail("");
    setMessage("");
    setEstateName("");
    setIsEstate(false);
    toast.success("Message sent — we'll be in touch.");
  }

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-14">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Contact</p>
        <h1 className="mt-4 text-4xl md:text-5xl">Say hello</h1>
        <p className="mt-4 max-w-xl text-sm text-muted-foreground">
          Estate listings, sponsored features, corrections to the guide, or a wine we should add —
          all of it lands in the same inbox.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="surface-card p-5">
            <MapPin className="h-4 w-4 text-gold" aria-hidden />
            <p className="mt-3 text-sm">Paarl, Cape Winelands</p>
            <p className="text-sm text-muted-foreground">Western Cape, South Africa</p>
          </div>
          <div className="surface-card p-5">
            <Mail className="h-4 w-4 text-gold" aria-hidden />
            <p className="mt-3 text-sm">Prefer email?</p>
            <a href="mailto:hello@paarlwine.com" className="text-sm text-gold hover:underline">
              hello@paarlwine.com
            </a>
          </div>
        </div>

        {sent ? (
          <div className="surface-card mt-8 p-8 text-center">
            <h2 className="text-3xl">Thank you</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your message is with us. We usually reply within two working days.
            </p>
            <Button variant="cellar" className="mt-6" onClick={() => setSent(false)}>
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="surface-card mt-8 space-y-5 p-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Your name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={120}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={200}
                  required
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="isEstate"
                checked={isEstate}
                onCheckedChange={(v) => setIsEstate(v === true)}
              />
              <Label htmlFor="isEstate" className="font-normal">
                I represent a wine estate
              </Label>
            </div>

            {isEstate && (
              <div className="space-y-2">
                <Label htmlFor="estateName">Estate name</Label>
                <Input
                  id="estateName"
                  value={estateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  maxLength={160}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                maxLength={4000}
                required
              />
            </div>

            <Button type="submit" variant="gold" size="lg" disabled={sending}>
              <Send className="h-4 w-4" />
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
