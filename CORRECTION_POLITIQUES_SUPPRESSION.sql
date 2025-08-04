-- Correction des politiques RLS pour la suppression des créations
-- Exécutez ce script dans votre éditeur SQL Supabase

-- =============================================
-- 1. VÉRIFICATION DES POLITIQUES EXISTANTES
-- =============================================

-- Vérifier les politiques actuelles pour la table creations
SELECT 
  'POLITIQUES ACTUELLES' as info,
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'creations' AND schemaname = 'public'
ORDER BY policyname;

-- =============================================
-- 2. SUPPRESSION DES POLITIQUES EXISTANTES
-- =============================================

-- Supprimer toutes les politiques existantes pour la table creations
DROP POLICY IF EXISTS "Users can view own creations" ON creations;
DROP POLICY IF EXISTS "Users can insert own creations" ON creations;
DROP POLICY IF EXISTS "Users can update own creations" ON creations;
DROP POLICY IF EXISTS "Users can delete own creations" ON creations;
DROP POLICY IF EXISTS "Public read access" ON creations;
DROP POLICY IF EXISTS "Authenticated users can create" ON creations;

-- =============================================
-- 3. CRÉATION DES NOUVELLES POLITIQUES
-- =============================================

-- Politique pour permettre la lecture publique des créations
CREATE POLICY "Public read access" ON creations
FOR SELECT USING (true);

-- Politique pour permettre aux utilisateurs authentifiés de créer des créations
CREATE POLICY "Authenticated users can create" ON creations
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  artisan_id = auth.uid()
);

-- Politique pour permettre aux artisans de voir leurs propres créations
CREATE POLICY "Users can view own creations" ON creations
FOR SELECT USING (
  auth.role() = 'authenticated' AND
  artisan_id = auth.uid()
);

-- Politique pour permettre aux artisans de modifier leurs propres créations
CREATE POLICY "Users can update own creations" ON creations
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  artisan_id = auth.uid()
);

-- Politique pour permettre aux artisans de supprimer leurs propres créations
CREATE POLICY "Users can delete own creations" ON creations
FOR DELETE USING (
  auth.role() = 'authenticated' AND
  artisan_id = auth.uid()
);

-- =============================================
-- 4. VÉRIFICATION DES NOUVELLES POLITIQUES
-- =============================================

-- Vérifier que les nouvelles politiques ont été créées
SELECT 
  'NOUVELLES POLITIQUES' as info,
  policyname,
  permissive,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'creations' AND schemaname = 'public'
ORDER BY policyname;

-- =============================================
-- 5. TEST DES PERMISSIONS
-- =============================================

-- Vérifier que RLS est activé
SELECT 
  'RLS STATUS' as info,
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'creations' AND schemaname = 'public';

-- =============================================
-- 6. VÉRIFICATION DES CRÉATIONS ET ARTISANS
-- =============================================

-- Voir les créations avec leurs artisans pour debug
SELECT 
  'DEBUG CREATIONS' as info,
  c.id,
  c.title,
  c.artisan_id,
  a.id as artisan_table_id,
  a.name as artisan_name,
  CASE 
    WHEN c.artisan_id = a.id THEN '✅ Correspondance'
    ELSE '❌ Pas de correspondance'
  END as statut_correspondance
FROM creations c
LEFT JOIN artisans a ON c.artisan_id = a.id
ORDER BY c.created_at DESC
LIMIT 5;

-- =============================================
-- 7. CORRECTION DES CORRESPONDANCES SI NÉCESSAIRE
-- =============================================

-- Si les artisan_id ne correspondent pas, les corriger
-- (à exécuter seulement si nécessaire)

-- UPDATE creations 
-- SET artisan_id = (
--   SELECT id FROM artisans 
--   WHERE id = creations.artisan_id
-- )
-- WHERE EXISTS (
--   SELECT 1 FROM artisans 
--   WHERE id = creations.artisan_id
-- );

-- =============================================
-- 8. MESSAGE DE FIN
-- =============================================

SELECT '🎉 CORRECTION DES POLITIQUES TERMINEE' as status; 