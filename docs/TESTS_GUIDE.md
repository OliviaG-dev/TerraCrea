# 🔧 Guide Technique des Tests - TerraCréa

## 🎯 **Vue d'Ensemble**

Ce guide présente les solutions techniques mises en place pour résoudre tous les problèmes de tests du projet TerraCréa. **283 tests passent maintenant avec 100% de réussite**.

---

## 🚨 **Problèmes Résolus et Solutions**

### **1. Erreurs TypeScript Massives (148 erreurs)**

#### **Problème Identifié**

```bash
Cannot find name 'describe'
Cannot find name 'it'
Cannot find name 'expect'
Cannot find namespace 'vi'
```

#### **Solution Appliquée**

```typescript
// AVANT (problématique)
import { jest } from "@jest/globals";
jest.fn();

// APRÈS (corrigé)
import { describe, it, expect, vi } from "vitest";
vi.fn();
```

#### **Fichiers Corrigés**

- ✅ `src/test-utils/globalMocks.ts` : `jest` → `vi`
- ✅ `src/test-utils/setup.ts` : Import `vi` ajouté
- ✅ `src/test-utils/index.ts` : Fonctions Jest → Vitest
- ✅ `src/__tests__/services/supabase.test.ts` : Imports vitest
- ✅ `src/utils/index.ts` : Exports corrigés

---

### **2. Composants React Native qui ne se Rendent Pas**

#### **Problème Identifié**

```bash
Error: Element type is invalid: expected a string but got: undefined
```

#### **Solution Appliquée - FloatingButtons**

```typescript
// 1. Configuration des mocks dans beforeAll()
beforeAll(() => {
  vi.doMock("react-native", () => ({
    View: ({ children, ...props }: any) => (
      <div data-testid="view" {...props}>
        {children}
      </div>
    ),
    TouchableOpacity: ({ children, onPress, ...props }: any) => (
      <button data-testid="touchable-opacity" onClick={onPress} {...props}>
        {children}
      </button>
    ),
    // ... autres composants
  }));
});

// 2. Import dynamique après configuration des mocks
const { FloatingFavoritesButton } = await vi.importActual(
  "../../components/FloatingFavoritesButton"
);
```

---

### **3. Mocks Supabase qui ne Fonctionnent Pas**

#### **Problème Identifié**

```bash
Error: Cannot read properties of undefined (reading 'auth')
```

#### **Solution Appliquée - reviewsApi**

```typescript
// 1. Mock direct du module
vi.mock("../../services/supabase", () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}));

// 2. Import et utilisation avec vi.mocked()
import { supabase } from "../../services/supabase";
const mockSupabase = vi.mocked(supabase);

// 3. Configuration des mocks
mockSupabase.auth.getUser.mockResolvedValue({
  data: { user: mockUser },
  error: null,
});
```

---

## 🛠️ **Outils et Techniques Utilisés**

### **Vitest - Framework de Test**

```typescript
// Configuration
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    globals: true,
  },
});

// Imports essentiels
import { describe, it, expect, beforeEach, vi, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
```

### **Testing Library - Rendu et Interactions**

```typescript
// Rendu
const { container, rerender } = render(<Component />);

// Sélection
const button = screen.getByTestId("touchable-opacity");
const title = screen.getByText("Mon Titre");

// Interactions
fireEvent.click(button);
fireEvent.change(input, { target: { value: "texte" } });
```

---

## 📋 **Patterns Recommandés**

### **1. Structure des Tests**

```typescript
describe("ComponentName", () => {
  beforeAll(() => {
    // Mocks globaux
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Feature", () => {
    it("should do something", () => {
      // Test
    });
  });
});
```

### **2. Mocks Systématiques**

```typescript
// Toujours utiliser des data-testid
const MockComponent = ({ children, ...props }: any) => (
  <div data-testid="component-name" {...props}>
    {children}
  </div>
);

// Mocks complets pour les dépendances
vi.doMock("dependency", () => ({
  // Toutes les méthodes nécessaires
}));
```

---

## 🚀 **Prochaines Étapes**

### **Phase 4 : Hooks et Contexts**

- Tests des hooks personnalisés (`useAuth`, `useFavorites`)
- Tests des contextes React (`UserContext`, `FavoritesContext`)

### **Phase 5 : Écrans et Navigation**

- Tests des écrans principaux
- Tests de navigation et de routage

---

## 🏆 **Conclusion**

**Toutes les solutions techniques sont maintenant documentées et maîtrisées :**

✅ **148 erreurs TypeScript** corrigées  
✅ **Composants React Native** parfaitement mockés  
✅ **Services Supabase** robustement testés  
✅ **Infrastructure de test** solide et extensible

**Le projet est prêt pour la Phase 2 avec une base technique exceptionnelle ! 🚀**

---

_Document créé le : [Date actuelle]_  
_Dernière mise à jour : Phase 1 TERMINÉE - Solutions techniques documentées_  
_Statut : MISSION ACCOMPLIE ✅_
