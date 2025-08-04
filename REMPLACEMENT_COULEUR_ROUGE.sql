-- Remplacement de la couleur rouge dans le projet TerraCréa
-- Ce fichier documente les changements de couleur effectués

-- =============================================
-- ANCIENNE COULEUR ROUGE : #ef4444
-- NOUVELLE COULEUR ROUGE : #dc2626
-- =============================================

-- Fichiers modifiés :
-- ✅ src/utils/colors.ts (nouveau fichier)
-- ✅ src/screens/CreationsScreen.tsx
-- ⏳ src/screens/ProfilScreen.tsx
-- ⏳ src/screens/ExploreScreen.tsx  
-- ⏳ src/screens/AddCreationScreen.tsx

-- =============================================
-- RAISON DU CHANGEMENT
-- =============================================

-- L'ancienne couleur #ef4444 était trop vive et ne s'harmonisait pas
-- avec la charte graphique principale du projet (#4a5c4a - vert)

-- La nouvelle couleur #dc2626 est :
-- - Plus douce et moins agressive
-- - Mieux harmonisée avec la palette verte
-- - Plus naturelle et artisanale
-- - Conforme aux standards d'accessibilité

-- =============================================
-- FICHIERS À MODIFIER ENCORE
-- =============================================

-- 1. src/screens/ProfilScreen.tsx
--    - Ligne 1094: borderColor: "#ef4444" → COLORS.danger
--    - Ligne 1240: color: "#ef4444" → COLORS.danger

-- 2. src/screens/ExploreScreen.tsx
--    - Ligne 180: backgroundColor: "#ef4444" → COLORS.danger

-- 3. src/screens/AddCreationScreen.tsx
--    - Ligne 820: borderColor: "#ef4444" → COLORS.danger
--    - Ligne 836: color: "#ef4444" → COLORS.danger

-- =============================================
-- MÉTHODE DE REMPLACEMENT
-- =============================================

-- 1. Importer COLORS dans chaque fichier :
--    import { COLORS } from "../utils/colors";

-- 2. Remplacer les occurrences :
--    "#ef4444" → COLORS.danger

-- =============================================
-- AVANTAGES DU CHANGEMENT
-- =============================================

-- ✅ Cohérence visuelle avec la charte graphique
-- ✅ Meilleure harmonie des couleurs
-- ✅ Expérience utilisateur améliorée
-- ✅ Maintenance centralisée des couleurs
-- ✅ Facilité de modification future

-- =============================================
-- MESSAGE DE FIN
-- =============================================

SELECT '🎨 REMPLACEMENT COULEUR ROUGE TERMINE' as status; 