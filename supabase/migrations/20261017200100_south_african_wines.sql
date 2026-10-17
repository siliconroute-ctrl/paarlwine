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
