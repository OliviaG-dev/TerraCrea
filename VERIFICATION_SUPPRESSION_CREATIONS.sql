-- Vérification de la suppression des créations
-- Exécutez ce script dans votre éditeur SQL Supabase

-- =============================================
-- 1. VÉRIFICATION DES POLITIQUES RLS POUR LA SUPPRESSION
-- =============================================

-- Vérifier les politiques RLS pour la table creations
SELECT 
  'POLITIQUES RLS CREATIONS' as info,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'creations' AND schemaname = 'public'
ORDER BY policyname;

-- =============================================
-- 2. VÉRIFICATION DES CRÉATIONS EXISTANTES
-- =============================================

-- Voir les créations existantes avec leurs artisans
SELECT 
  'CREATIONS EXISTANTES' as info,
  c.id,
  c.title,
  c.artisan_id,
  a.name as artisan_name,
  c.created_at,
  c.image_url IS NOT NULL as has_image
FROM creations c
LEFT JOIN artisans a ON c.artisan_id = a.id
ORDER BY c.created_at DESC
LIMIT 10;

-- =============================================
-- 3. TEST DE SUPPRESSION MANUEL
-- =============================================

-- Créer une création de test pour tester la suppression
-- (à exécuter seulement si vous voulez tester)

-- INSERT INTO creations (
--   id,
--   title,
--   description,
--   price,
--   category_id,
--   artisan_id,
--   materials,
--   tags,
--   rating,
--   review_count,
--   is_available
-- ) VALUES (
--   gen_random_uuid(),
--   'Création de test pour suppression',
--   'Cette création sera supprimée pour tester',
--   25.00,
--   'CERAMICS',
--   (SELECT id FROM artisans LIMIT 1),
--   ARRAY['argile', 'émail'],
--   ARRAY['test', 'suppression'],
--   4.5,
--   0,
--   true
-- );

-- =============================================
-- 4. VÉRIFICATION DES TRIGGERS
-- =============================================

-- Vérifier s'il y a des triggers sur la table creations
SELECT 
  'TRIGGERS CREATIONS' as info,
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers
WHERE event_object_table = 'creations'
ORDER BY trigger_name;

-- =============================================
-- 5. VÉRIFICATION DES CONTRAINTES
-- =============================================

-- Vérifier les contraintes sur la table creations
SELECT 
  'CONTRAINTES CREATIONS' as info,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints
WHERE table_name = 'creations'
ORDER BY constraint_type, constraint_name;

-- =============================================
-- 6. CORRECTION DES POLITIQUES SI NÉCESSAIRE
-- =============================================

-- Supprimer les politiques existantes pour la suppression
-- DROP POLICY IF EXISTS "Users can delete own creations" ON creations;

-- Créer une politique pour permettre aux artisans de supprimer leurs créations
-- CREATE POLICY "Users can delete own creations" ON creations
-- FOR DELETE USING (
--   artisan_id = auth.uid()
-- );

-- =============================================
-- 7. VÉRIFICATION DES PERMISSIONS
-- =============================================

-- Vérifier les permissions sur la table creations
SELECT 
  'PERMISSIONS CREATIONS' as info,
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants
WHERE table_name = 'creations'
ORDER BY grantee, privilege_type;

-- =============================================
-- 8. MESSAGE DE FIN
-- =============================================

SELECT '🎉 VERIFICATION SUPPRESSION TERMINEE' as status; 