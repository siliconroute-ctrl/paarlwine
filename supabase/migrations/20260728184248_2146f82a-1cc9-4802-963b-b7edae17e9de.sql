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