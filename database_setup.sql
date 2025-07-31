-- Configuration de la base de données TerraCréa
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne is_artisan à la table users existante
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_artisan BOOLEAN DEFAULT FALSE;

-- 2. Créer la table des profils artisans
CREATE TABLE IF NOT EXISTS artisan_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  established_year INTEGER,
  specialties TEXT[] DEFAULT '{}',
  verified BOOLEAN DEFAULT FALSE,
  rating DECIMAL(3,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Activer RLS sur la table artisan_profiles
ALTER TABLE artisan_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer les politiques RLS pour artisan_profiles (seulement si elles n'existent pas)
DO $$
BEGIN
  -- Politique pour SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artisan_profiles' 
    AND policyname = 'Users can view their own artisan profile'
  ) THEN
    CREATE POLICY "Users can view their own artisan profile" ON artisan_profiles
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Politique pour UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artisan_profiles' 
    AND policyname = 'Users can update their own artisan profile'
  ) THEN
    CREATE POLICY "Users can update their own artisan profile" ON artisan_profiles
      FOR UPDATE USING (auth.uid() = user_id);
  END IF;

  -- Politique pour INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'artisan_profiles' 
    AND policyname = 'Users can insert their own artisan profile'
  ) THEN
    CREATE POLICY "Users can insert their own artisan profile" ON artisan_profiles
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. Créer la fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Créer le trigger pour artisan_profiles (seulement s'il n'existe pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_artisan_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_artisan_profiles_updated_at 
      BEFORE UPDATE ON artisan_profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 7. Créer le trigger pour la table users (seulement s'il n'existe pas)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_users_updated_at'
  ) THEN
    CREATE TRIGGER update_users_updated_at 
      BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- 8. Vérifier que RLS est activé sur users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 9. Créer les politiques RLS pour users (seulement si elles n'existent pas)
DO $$
BEGIN
  -- Politique pour SELECT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can view their own profile'
  ) THEN
    CREATE POLICY "Users can view their own profile" ON users
      FOR SELECT USING (auth.uid() = id);
  END IF;

  -- Politique pour UPDATE
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile" ON users
      FOR UPDATE USING (auth.uid() = id);
  END IF;

  -- Politique pour INSERT
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'users' 
    AND policyname = 'Users can insert their own profile'
  ) THEN
    CREATE POLICY "Users can insert their own profile" ON users
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 10. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_artisan_profiles_user_id ON artisan_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_users_is_artisan ON users(is_artisan);

-- 11. Vérification des tables et politiques créées
SELECT 
  'Tables' as type,
  table_name as name,
  'Created' as status
FROM information_schema.tables 
WHERE table_name IN ('users', 'artisan_profiles')
ORDER BY table_name;

SELECT 
  'Policies' as type,
  policyname as name,
  'Active' as status
FROM pg_policies 
WHERE tablename IN ('users', 'artisan_profiles')
ORDER BY tablename, policyname;

SELECT 
  'Triggers' as type,
  tgname as name,
  'Active' as status
FROM pg_trigger 
WHERE tgname IN ('update_artisan_profiles_updated_at', 'update_users_updated_at')
ORDER BY tgname; 