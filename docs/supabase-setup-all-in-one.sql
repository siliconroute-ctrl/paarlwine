-- Terroir: complete database setup. Paste ALL of this into Supabase > SQL Editor > New query, then click Run.
-- Run it once, on a new empty project only.

-- ===== 20260728184248_2146f82a-1cc9-4802-963b-b7edae17e9de.sql =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  home_country TEXT NOT NULL DEFAULT 'United States',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.wines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  grape TEXT NOT NULL,
  color TEXT NOT NULL,
  body TEXT,
  sweetness TEXT,
  tasting_notes TEXT,
  food_pairings TEXT[] NOT NULL DEFAULT '{}',
  equivalents TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.wines TO anon;
GRANT SELECT ON public.wines TO authenticated;
GRANT ALL ON public.wines TO service_role;
ALTER TABLE public.wines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Wine guide is public" ON public.wines FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label_text TEXT,
  wine_name TEXT NOT NULL,
  producer TEXT,
  country TEXT,
  region TEXT,
  grape TEXT,
  color TEXT,
  summary TEXT,
  equivalent_name TEXT,
  equivalent_country TEXT,
  equivalent_note TEXT,
  home_country TEXT,
  image_path TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own scans" ON public.scans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.wines (name, country, region, grape, color, body, sweetness, tasting_notes, food_pairings, equivalents, description) VALUES
('Sancerre','France','Loire Valley','Sauvignon Blanc','White','Light','Dry','Grapefruit, flint, cut grass, high acidity','{"Goat cheese","Oysters","Green salads"}','{"Marlborough Sauvignon Blanc","Rueda Verdejo","Napa Sauvignon Blanc"}','France labels by place, not grape. Sancerre is simply Sauvignon Blanc from the eastern Loire — leaner and more mineral than New World versions.'),
('Chablis','France','Burgundy','Chardonnay','White','Light','Dry','Green apple, lemon, oyster shell, no oak','{"Shellfish","Sushi","Roast chicken"}','{"Unoaked Chardonnay","Sonoma Coast Chardonnay","Italian Soave"}','Chablis is unoaked Chardonnay. If you like crisp, steely whites rather than buttery ones, this is your bottle.'),
('Bourgogne Rouge','France','Burgundy','Pinot Noir','Red','Light','Dry','Red cherry, forest floor, soft tannin','{"Duck","Mushroom risotto","Salmon"}','{"Oregon Pinot Noir","Central Otago Pinot Noir","German Spatburgunder"}','Red Burgundy is always Pinot Noir. Village and regional bottles are the affordable entry point.'),
('Bordeaux Rouge','France','Bordeaux','Cabernet Sauvignon / Merlot blend','Red','Full','Dry','Blackcurrant, cedar, graphite, firm tannin','{"Steak","Lamb","Hard cheese"}','{"Napa Cabernet Sauvignon","Chilean Cabernet blend","Coonawarra Cabernet"}','Left Bank leans Cabernet, Right Bank leans Merlot. Think of it as the original Cabernet blend.'),
('Chateauneuf-du-Pape','France','Southern Rhone','Grenache blend','Red','Full','Dry','Kirsch, garrigue herbs, pepper, warm spice','{"Braised beef","Game","Herbed lamb"}','{"Australian GSM","Spanish Garnacha","Paso Robles Rhone blend"}','A Grenache-led blend. Australia sells the same idea as GSM (Grenache-Shiraz-Mourvedre).'),
('Beaujolais Villages','France','Beaujolais','Gamay','Red','Light','Dry','Raspberry, banana, violets, low tannin','{"Charcuterie","Roast pork","Pizza"}','{"Light Pinot Noir","Austrian Zweigelt","Chilled Cinsault"}','Juicy, low-tannin red best served slightly chilled.'),
('Champagne Brut','France','Champagne','Chardonnay / Pinot Noir / Meunier','Sparkling','Light','Dry','Brioche, green apple, fine bubbles','{"Fried food","Oysters","Celebrations"}','{"English Sparkling","Cava Brut","Franciacorta","Traditional-method sparkling"}','Traditional-method sparkling from Champagne. Cava and Franciacorta use the same method for less money.'),
('Barolo','Italy','Piedmont','Nebbiolo','Red','Full','Dry','Tar, rose, sour cherry, grippy tannin','{"Truffle pasta","Braised beef","Aged cheese"}','{"Aged Bordeaux","Northern Rhone Syrah","Aged Rioja Gran Reserva"}','Nebbiolo under another name. Pale in colour but powerfully tannic — decant it.'),
('Chianti Classico','Italy','Tuscany','Sangiovese','Red','Medium','Dry','Sour cherry, tomato leaf, dried herbs','{"Tomato pasta","Pizza","Grilled sausage"}','{"Rioja Crianza","Mencia","Cabernet Franc"}','Sangiovese with bright acidity — built for tomato-based food.'),
('Prosecco','Italy','Veneto','Glera','Sparkling','Light','Off-dry','Pear, white flowers, soft bubbles','{"Aperitivo","Prosciutto","Brunch"}','{"Sekt","Moscato dAsti","Cremant"}','Tank-method sparkling: fruitier and softer than Champagne.'),
('Soave Classico','Italy','Veneto','Garganega','White','Light','Dry','Almond, white peach, saline finish','{"Seafood pasta","Risotto","Fried fish"}','{"Chablis","Albarino","Dry Riesling"}','A quiet, mineral Italian white that stands in for unoaked Chardonnay.'),
('Amarone della Valpolicella','Italy','Veneto','Corvina blend','Red','Full','Dry','Dried cherry, fig, chocolate, high alcohol','{"Aged cheese","Stews","Dark chocolate"}','{"Zinfandel","Australian Shiraz","Douro red"}','Made from dried grapes: rich, raisined and high in alcohol.'),
('Pinot Grigio','Italy','Alto Adige','Pinot Gris','White','Light','Dry','Pear, lemon zest, crisp and neutral','{"Light salads","White fish","Antipasti"}','{"Alsace Pinot Gris","Oregon Pinot Gris","Muscadet"}','Same grape as Alsace Pinot Gris but picked earlier — lighter and crisper.'),
('Rioja Crianza','Spain','Rioja','Tempranillo','Red','Medium','Dry','Red plum, vanilla, dill from American oak','{"Roast lamb","Tapas","Chorizo"}','{"Chianti Classico","Douro red","Cabernet-Merlot blend"}','Tempranillo aged in oak. Older Reservas taste softer and more savoury.'),
('Albarino','Spain','Rias Baixas','Albarino','White','Light','Dry','Grapefruit, nectarine, sea spray','{"Shellfish","Ceviche","Grilled sardines"}','{"Vinho Verde Alvarinho","Sauvignon Blanc","Dry Riesling"}','Coastal, salty white — the Spanish answer to a crisp Sauvignon Blanc.'),
('Priorat','Spain','Catalonia','Garnacha / Carinena','Red','Full','Dry','Black fruit, slate, liquorice, dense','{"Grilled meat","Game","Aged Manchego"}','{"Chateauneuf-du-Pape","Barossa GSM","Douro red"}','Concentrated old-vine Grenache grown on slate soils.'),
('Cava Brut','Spain','Penedes','Macabeo / Xarel-lo / Parellada','Sparkling','Light','Dry','Green apple, lemon, bready notes','{"Tapas","Fried food","Brunch"}','{"Champagne Brut","Cremant","English Sparkling"}','Made the same way as Champagne, usually for a third of the price.'),
('Riesling Kabinett','Germany','Mosel','Riesling','White','Light','Off-dry','Lime, green apple, slate, low alcohol','{"Spicy Thai","Pork","Sushi"}','{"Alsace Riesling","Clare Valley Riesling","Austrian Gruner Veltliner"}','Lightly sweet and very low in alcohol. Australian Riesling is the bone-dry cousin.'),
('Spatburgunder','Germany','Baden','Pinot Noir','Red','Light','Dry','Cranberry, earth, gentle spice','{"Duck","Charcuterie","Mushrooms"}','{"Bourgogne Rouge","Oregon Pinot Noir","Sancerre Rouge"}','Simply the German name for Pinot Noir.'),
('Gruner Veltliner','Austria','Wachau','Gruner Veltliner','White','Light','Dry','White pepper, lentil, green apple','{"Schnitzel","Asparagus","Herby salads"}','{"Sauvignon Blanc","Dry Riesling","Chablis"}','Peppery, food-friendly white — a great Sauvignon Blanc alternative.'),
('Douro Tinto','Portugal','Douro Valley','Touriga Nacional blend','Red','Full','Dry','Blackberry, violet, dark spice','{"Grilled meats","Stews","Hard cheese"}','{"Rioja Reserva","Australian Shiraz","Bordeaux Rouge"}','Table wine from the same grapes used for Port — deep and structured.'),
('Vinho Verde','Portugal','Minho','Loureiro / Alvarinho','White','Light','Dry','Lime, green apple, slight spritz','{"Grilled fish","Salads","Hot weather"}','{"Pinot Grigio","Muscadet","Txakoli"}','Light, faintly fizzy and low in alcohol.'),
('Napa Cabernet Sauvignon','United States','Napa Valley','Cabernet Sauvignon','Red','Full','Dry','Blackcurrant, mocha, sweet oak, ripe tannin','{"Ribeye","Burgers","Aged cheddar"}','{"Bordeaux Rouge","Coonawarra Cabernet","Maipo Cabernet"}','Riper and more oak-driven than Bordeaux, from the same grape.'),
('Oregon Pinot Noir','United States','Willamette Valley','Pinot Noir','Red','Light','Dry','Bing cherry, cola, damp earth','{"Salmon","Duck","Mushroom dishes"}','{"Bourgogne Rouge","Spatburgunder","Central Otago Pinot Noir"}','The closest New World match for red Burgundy.'),
('California Zinfandel','United States','Lodi','Zinfandel','Red','Full','Dry','Blackberry jam, pepper, sweet spice','{"BBQ","Ribs","Burgers"}','{"Primitivo","Amarone","Australian Shiraz"}','Genetically the same grape as Italian Primitivo.'),
('Barossa Shiraz','Australia','Barossa Valley','Shiraz','Red','Full','Dry','Blueberry, chocolate, black pepper','{"BBQ","Lamb","Aged cheese"}','{"Northern Rhone Syrah","Zinfandel","Douro red"}','Shiraz and Syrah are the same grape; Barossa makes the richest style.'),
('Clare Valley Riesling','Australia','Clare Valley','Riesling','White','Light','Dry','Lime, chalk, piercing acidity, bone dry','{"Oysters","Thai food","Goat cheese"}','{"Alsace Riesling","Austrian Riesling","Mosel Trocken"}','Bone-dry Riesling — nothing like the off-dry German style.'),
('Marlborough Sauvignon Blanc','New Zealand','Marlborough','Sauvignon Blanc','White','Light','Dry','Passionfruit, gooseberry, fresh herbs','{"Goat cheese","Green vegetables","Seafood"}','{"Sancerre","Rueda Verdejo","Chilean Sauvignon Blanc"}','Louder and more tropical than Sancerre, from the same grape.'),
('Mendoza Malbec','Argentina','Mendoza','Malbec','Red','Full','Dry','Plum, violet, cocoa, velvety tannin','{"Steak","Empanadas","Grilled vegetables"}','{"Cahors Malbec","Merlot","Douro red"}','Malbec began in Cahors, France, where it is firmer and more savoury.'),
('Stellenbosch Chenin Blanc','South Africa','Stellenbosch','Chenin Blanc','White','Medium','Dry','Quince, yellow apple, honeyed edge','{"Roast chicken","Curries","Pork"}','{"Vouvray Sec","Savennieres","Unoaked Chardonnay"}','Called Steen locally; the same grape as Loire Vouvray.');
-- ===== 20260728184256_f4daaa71-7b39-4e7d-a3e2-be3ca4c3bf2f.sql =====
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
-- ===== 20260728184310_6974b2ba-4caa-444a-9a64-fd681caa8cbc.sql =====
CREATE POLICY "Users read own label photos" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'wine-labels' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own label photos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'wine-labels' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own label photos" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'wine-labels' AND auth.uid()::text = (storage.foldername(name))[1]);
-- ===== 20260729103348_d06649a3-32ef-4af5-885d-34738b1b8d53.sql =====
CREATE TABLE public.contact_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  is_estate BOOLEAN NOT NULL DEFAULT false,
  estate_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;

ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a contact message"
ON public.contact_messages FOR INSERT TO anon, authenticated
WITH CHECK (
  length(trim(name)) BETWEEN 1 AND 120
  AND length(trim(email)) BETWEEN 3 AND 200
  AND length(trim(message)) BETWEEN 1 AND 4000
  AND (estate_name IS NULL OR length(estate_name) <= 160)
);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_contact_messages_updated_at
BEFORE UPDATE ON public.contact_messages
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- ===== 20260729130706_529a5e9f-8075-47dd-8c02-12fab54cb961.sql =====
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

GRANT SELECT ON public.contact_messages TO authenticated;

CREATE POLICY "Admins can read contact messages"
ON public.contact_messages FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
-- ===== 20261017200000_scan_log.sql =====
-- Per-user log of AI label scans, used to enforce a daily cap (cost protection).
CREATE TABLE public.scan_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX scan_log_user_created_idx ON public.scan_log (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.scan_log TO authenticated;
GRANT ALL ON public.scan_log TO service_role;

ALTER TABLE public.scan_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own scan log" ON public.scan_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users add own scan log" ON public.scan_log
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ===== 20261017200100_south_african_wines.sql =====
-- Adds South African (Cape / Paarl) wines to the guide so the app showcases the home region,
-- and lists Cape bottles as "similar bottles" for classic foreign wines.

INSERT INTO public.wines (name, country, region, grape, color, body, sweetness, tasting_notes, food_pairings, equivalents, description) VALUES
('Paarl Shiraz','South Africa','Paarl','Shiraz','Red','Full','Dry','Blackberry, black pepper, smoked meat, warm spice','{"Braai","Lamb","Aged cheese"}','{"Northern Rhone Syrah","Barossa Shiraz","Languedoc Syrah"}','Paarl is warm and sunny, which gives ripe, generous Shiraz. The same grape as Syrah in France, usually fuller and fruitier than the Rhone original.'),
('Pinotage','South Africa','Paarl and Stellenbosch','Pinotage','Red','Full','Dry','Dark plum, blackberry, smoke, a hint of banana or spice','{"Braai","Bobotie","Spicy sausage"}','{"Californian Zinfandel","Barossa Shiraz","Mendoza Malbec"}','South Africa''s own grape, created in 1925 by crossing Pinot Noir and Cinsaut. Styles range from juicy and easy to deep and oaked.'),
('Cape Red Blend','South Africa','Paarl','Cabernet Sauvignon / Merlot / Shiraz blend','Red','Full','Dry','Blackcurrant, plum, cedar, soft spice','{"Steak","Roast lamb","Hard cheese"}','{"Bordeaux Rouge","Douro Tinto","Chilean Cabernet blend"}','Cape winemakers love to blend. Expect a ripe, rounded red in the Bordeaux spirit, often with Shiraz or Pinotage adding spice.'),
('Paarl Rhone-Style Red','South Africa','Paarl','Shiraz / Grenache / Mourvedre blend','Red','Full','Dry','Dark cherry, pepper, dried herbs, warm spice','{"Braised beef","Herbed lamb","Game"}','{"Chateauneuf-du-Pape","Australian GSM","Priorat"}','Paarl''s granite slopes and warm days suit the grapes of the southern Rhone. A Cape take on the classic Grenache-led blend.'),
('Stellenbosch Cabernet Sauvignon','South Africa','Stellenbosch','Cabernet Sauvignon','Red','Full','Dry','Blackcurrant, cedar, mint, firm tannin','{"Ribeye","Lamb chops","Aged cheddar"}','{"Bordeaux Rouge","Napa Cabernet Sauvignon","Coonawarra Cabernet"}','Structured and age-worthy. Stellenbosch is the Cape home of Cabernet and Bordeaux-style blends.'),
('Swartland Cinsault','South Africa','Swartland','Cinsault','Red','Light','Dry','Red cherry, rose petal, light spice, fresh acidity','{"Charcuterie","Roast chicken","Pizza"}','{"Beaujolais Villages","Bourgogne Rouge","Chilled Cinsault"}','Old bush-vine Cinsault makes a juicy, light red that drinks well slightly chilled.'),
('Walker Bay Pinot Noir','South Africa','Walker Bay','Pinot Noir','Red','Light','Dry','Red cherry, earth, mushroom, soft tannin','{"Duck","Salmon","Mushroom dishes"}','{"Bourgogne Rouge","Oregon Pinot Noir","Central Otago Pinot Noir"}','Cool sea air on the south coast gives elegant Pinot Noir, closer to Burgundy than to the warm winelands.'),
('Paarl Chardonnay','South Africa','Paarl','Chardonnay','White','Medium','Dry','Citrus, pear, toast, creamy texture','{"Roast chicken","Creamy pasta","Grilled fish"}','{"Chablis","Sonoma Coast Chardonnay","Macon-Villages"}','Cooler slopes on the Simonsberg side of Paarl give fresh Chardonnay, from crisp and unoaked to rich and barrel-fermented.'),
('Cape Sauvignon Blanc','South Africa','Durbanville and Elgin','Sauvignon Blanc','White','Light','Dry','Grapefruit, green pepper, fig leaf, fresh acidity','{"Goat cheese","Seafood","Green salads"}','{"Sancerre","Marlborough Sauvignon Blanc","Rueda Verdejo"}','Cool coastal vineyards keep Sauvignon Blanc crisp. Between Loire restraint and New Zealand fruit.'),
('Swartland Old-Vine Chenin Blanc','South Africa','Swartland','Chenin Blanc','White','Medium','Dry','Quince, honey, dried herbs, stony finish','{"Roast pork","Curry","Creamy cheese"}','{"Vouvray Sec","Savennieres","Unoaked Chardonnay"}','Dry-farmed bush vines, some decades old, give textured Chenin Blanc with real depth.'),
('Franschhoek Semillon','South Africa','Franschhoek','Semillon','White','Medium','Dry','Lemon, lanolin, beeswax, nutty age','{"Cape Malay curry","Roast chicken","Fish in cream sauce"}','{"Bordeaux Blanc","Hunter Valley Semillon","Mature Chenin Blanc"}','Semillon was once the most planted grape at the Cape. Today a small group of producers make waxy, ageable wines.'),
('Methode Cap Classique','South Africa','Western Cape','Chardonnay / Pinot Noir blend','Sparkling','Light','Dry','Brioche, green apple, citrus, fine bubbles','{"Oysters","Fried food","Celebrations"}','{"Champagne Brut","Cava Brut","Franciacorta"}','Cap Classique is South Africa''s name for sparkling wine made by the same bottle-fermentation method as Champagne.'),
('Noble Late Harvest Chenin','South Africa','Paarl and Stellenbosch','Chenin Blanc','White','Full','Sweet','Apricot, honey, orange peel, bright acidity','{"Blue cheese","Fruit tarts","Foie gras"}','{"Sauternes","Tokaji","Riesling Auslese"}','Sweet wine from grapes shrivelled by noble rot. Lusciousness balanced by Chenin''s natural acidity.'),
('Cape Port-Style Fortified','South Africa','Paarl','Touriga Nacional / Tinta Barocca','Fortified','Full','Sweet','Plum, dark chocolate, fig, spice','{"Dark chocolate","Blue cheese","Walnuts"}','{"Late Bottled Vintage Port","Australian Tawny","Douro Tinto"}','Paarl has made fortified wine in the port style for generations, using Portuguese grapes and Cape sunshine.');

-- Show Cape bottles as "similar bottles" for classic foreign wines.
UPDATE public.wines SET equivalents = array_append(equivalents, 'Cape Sauvignon Blanc')
  WHERE name = 'Sancerre' AND NOT ('Cape Sauvignon Blanc' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Paarl Chardonnay')
  WHERE name = 'Chablis' AND NOT ('Paarl Chardonnay' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Walker Bay Pinot Noir')
  WHERE name = 'Bourgogne Rouge' AND NOT ('Walker Bay Pinot Noir' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Paarl Rhone-Style Red')
  WHERE name = 'Chateauneuf-du-Pape' AND NOT ('Paarl Rhone-Style Red' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Methode Cap Classique')
  WHERE name IN ('Champagne Brut','Cava Brut') AND NOT ('Methode Cap Classique' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Paarl Shiraz')
  WHERE name = 'Barossa Shiraz' AND NOT ('Paarl Shiraz' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Stellenbosch Cabernet Sauvignon')
  WHERE name IN ('Bordeaux Rouge','Napa Cabernet Sauvignon') AND NOT ('Stellenbosch Cabernet Sauvignon' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Swartland Cinsault')
  WHERE name = 'Beaujolais Villages' AND NOT ('Swartland Cinsault' = ANY(equivalents));
UPDATE public.wines SET equivalents = array_append(equivalents, 'Swartland Old-Vine Chenin Blanc')
  WHERE name = 'Soave Classico' AND NOT ('Swartland Old-Vine Chenin Blanc' = ANY(equivalents));

-- ===== 20261017200200_fix_equivalent_typos.sql =====
-- Fix a typo in the original seed data (missing apostrophe).
UPDATE public.wines
SET equivalents = array_replace(equivalents, 'Moscato dAsti', 'Moscato d''Asti')
WHERE 'Moscato dAsti' = ANY(equivalents);

-- ===== 20261017200300_label_photo_bucket.sql =====
-- The private bucket for users' label photos. The access policies for it already exist in an earlier
-- migration; the bucket itself was originally created outside migrations, so a fresh Supabase project
-- needs this row for photo uploads to work.
INSERT INTO storage.buckets (id, name, public)
VALUES ('wine-labels', 'wine-labels', false)
ON CONFLICT (id) DO NOTHING;

-- ===== 20261029160000_harden_default_privileges.sql =====
-- 1. The automatic-RLS helper is an internal event-trigger function; it should not be callable through the public API.
--    (Only exists when "Enable automatic RLS" was ticked at project creation.)
DO $$
BEGIN
  IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
    REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
  END IF;
END $$;

-- 2. Remove powers the app never needs from the public API roles. Row-level security does not cover these.
REVOKE TRUNCATE, REFERENCES, TRIGGER ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

-- 3. Stop those extra powers being granted automatically on tables created in future.
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE TRUNCATE, REFERENCES, TRIGGER ON TABLES FROM anon, authenticated;
