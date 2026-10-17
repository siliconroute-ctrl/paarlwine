-- Fix a typo in the original seed data (missing apostrophe).
UPDATE public.wines
SET equivalents = array_replace(equivalents, 'Moscato dAsti', 'Moscato d''Asti')
WHERE 'Moscato dAsti' = ANY(equivalents);
