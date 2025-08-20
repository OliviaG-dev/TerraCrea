# 🧪 Recommandations de Tests - TerraCréa

## 📊 État actuel de la couverture

- **Total des tests** : 163+ tests
- **Services API** : 147 tests ✅ (Bien couvert)
- **Tests d'intégration** : 14 tests ✅ (Bien couvert)
- **Composants React Native** : 0 tests ❌ (Non couvert)
- **Hooks personnalisés** : 0 tests ❌ (Non couvert)
- **Contexts React** : 0 tests ❌ (Non couvert)
- **Utilitaires** : 2 tests basiques ❌ (Très peu couvert)

---

## 🎯 **1. Tests des Composants React Native**

### **Priorité : HAUTE** - Impact direct sur l'expérience utilisateur

#### **1.1 AutoSuggestInput.tsx**

```typescript
describe("AutoSuggestInput", () => {
  // Tests d'affichage
  it("should display suggestions when typing", () => {});
  it("should filter suggestions based on input", () => {});
  it("should limit suggestions to maxSuggestions", () => {});

  // Tests d'interaction
  it("should select suggestion on press", () => {});
  it("should hide suggestions on blur", () => {});
  it("should show suggestions on focus", () => {});

  // Tests des callbacks
  it("should call onSuggestionSelect when suggestion is selected", () => {});
  it("should call onSuggestionsFetchRequested when typing", () => {});
  it("should call onSuggestionsClearRequested when clearing", () => {});

  // Tests des états
  it("should handle empty suggestions array", () => {});
  it("should handle null/undefined props gracefully", () => {});
});
```

#### **1.2 CreationCard.tsx**

```typescript
describe("CreationCard", () => {
  // Tests d'affichage
  it("should display creation information correctly", () => {});
  it("should show artisan profile information", () => {});
  it("should display price and rating", () => {});

  // Tests d'interaction
  it("should handle favorite button press", () => {});
  it("should navigate to detail on press", () => {});
  it("should handle image loading states", () => {});

  // Tests des états
  it("should show loading state while fetching data", () => {});
  it("should handle missing images gracefully", () => {});
  it("should display availability status", () => {});
});
```

#### **1.3 CommonButton.tsx**

```typescript
describe("CommonButton", () => {
  // Tests de rendu
  it("should render different button types correctly", () => {});
  it("should apply custom styles when provided", () => {});
  it("should show loading state when loading prop is true", () => {});

  // Tests d'interaction
  it("should call onPress when pressed", () => {});
  it("should be disabled when disabled prop is true", () => {});
  it("should show different text based on props", () => {});

  // Tests d'accessibilité
  it("should have proper accessibility labels", () => {});
  it("should support keyboard navigation", () => {});
});
```

#### **1.4 CommonHeader.tsx**

```typescript
describe("CommonHeader", () => {
  it("should display title correctly", () => {});
  it("should handle back button press", () => {});
  it("should show/hide back button based on props", () => {});
  it("should handle right button actions", () => {});
});
```

---

## 🪝 **2. Tests des Hooks personnalisés**

### **Priorité : HAUTE** - Logique métier critique

#### **2.1 useAuth.ts**

```typescript
describe("useAuth", () => {
  // Tests d'état initial
  it("should start with loading true and user null", () => {});
  it("should initialize with current session if exists", () => {});

  // Tests d'authentification
  it("should sign in user successfully", async () => {});
  it("should sign up user successfully", async () => {});
  it("should sign out user successfully", async () => {});

  // Tests de gestion d'erreurs
  it("should handle authentication errors gracefully", async () => {});
  it("should set error state on failure", async () => {});

  // Tests de changements d'état
  it("should update user state on auth state change", () => {});
  it("should handle session expiration", () => {});

  // Tests de nettoyage
  it("should unsubscribe from auth state changes on unmount", () => {});
});
```

#### **2.2 useFavorites.ts** (si existant)

```typescript
describe("useFavorites", () => {
  it("should load user favorites on mount", () => {});
  it("should add item to favorites", async () => {});
  it("should remove item from favorites", async () => {});
  it("should sync with API on changes", () => {});
  it("should handle API errors gracefully", () => {});
});
```

---

## 🎭 **3. Tests des Contexts React**

### **Priorité : MOYENNE** - État global de l'application

#### **3.1 UserContext.tsx**

```typescript
describe("UserContext", () => {
  // Tests de fourniture de contexte
  it("should provide user data to children", () => {});
  it("should provide authentication methods", () => {});
  it("should provide user capabilities", () => {});

  // Tests de mise à jour
  it("should update user profile successfully", async () => {});
  it("should upgrade user to artisan", async () => {});
  it("should refresh user data", async () => {});

  // Tests de gestion d'erreurs
  it("should handle profile update errors", async () => {});
  it("should handle network failures", async () => {});
});
```

#### **3.2 FavoritesContext.tsx**

```typescript
describe("FavoritesContext", () => {
  it("should provide favorites state to children", () => {});
  it("should sync favorites with API", () => {});
  it("should handle favorite operations", async () => {});
  it("should manage loading states", () => {});
});
```

---

## 🛠️ **4. Tests des Utilitaires**

### **Priorité : MOYENNE** - Fonctions réutilisables

#### **4.1 timeUtils.ts**

```typescript
describe("timeUtils", () => {
  describe("formatDate", () => {
    it("should format valid dates correctly", () => {});
    it("should handle invalid dates gracefully", () => {});
    it("should format relative time (il y a X minutes)", () => {});
    it("should format absolute dates for older items", () => {});
  });

  describe("checkTimeSync", () => {
    it("should detect time synchronization issues", async () => {});
    it("should handle network failures gracefully", async () => {});
    it("should return correct time differences", async () => {});
  });

  describe("isTimeSyncError", () => {
    it("should identify time sync errors correctly", () => {});
    it("should handle various error message formats", () => {});
    it("should return false for non-time-sync errors", () => {});
  });

  describe("formatLocalTime", () => {
    it("should format time in French locale", () => {});
    it("should use Europe/Paris timezone", () => {});
    it("should handle different date inputs", () => {});
  });
});
```

#### **4.2 userUtils.ts**

```typescript
describe("userUtils", () => {
  describe("getUserCapabilities", () => {
    it("should return correct capabilities for regular users", () => {});
    it("should return correct capabilities for artisans", () => {});
    it("should handle undefined user gracefully", () => {});
  });

  describe("createDefaultUser", () => {
    it("should create user with default values", () => {});
    it("should preserve provided user data", () => {});
    it("should handle partial user data", () => {});
  });
});
```

#### **4.3 colors.ts et commonStyles.ts**

```typescript
describe("colors", () => {
  it("should export all required color constants", () => {});
  it("should have valid hex color values", () => {});
  it("should maintain color consistency", () => {});
});

describe("commonStyles", () => {
  it("should export common style objects", () => {});
  it("should have valid style properties", () => {});
  it("should be reusable across components", () => {});
});
```

---

## 🔗 **5. Tests d'Intégration supplémentaires**

### **Priorité : BASSE** - Déjà bien couverts

#### **5.1 Workflows complets**

```typescript
describe("Complete User Workflows", () => {
  it("should complete full registration → creation → sale flow", async () => {});
  it("should handle favorites with authentication", async () => {});
  it("should manage rating and review system", async () => {});
  it("should handle search and filtering workflow", async () => {});
});
```

#### **5.2 Gestion des erreurs réseau**

```typescript
describe("Network Error Handling", () => {
  it("should handle request timeouts", async () => {});
  it("should retry failed requests automatically", async () => {});
  it("should provide fallback data on network failure", async () => {});
  it("should handle offline scenarios gracefully", async () => {});
});
```

---

## ⚡ **6. Tests de Performance**

### **Priorité : BASSE** - Optimisation future

```typescript
describe("Performance Tests", () => {
  it("should render components within performance budget", () => {});
  it("should handle large data sets efficiently", () => {});
  it("should optimize re-renders", () => {});
  it("should manage memory usage properly", () => {});
});
```

---

## ♿ **7. Tests d'Accessibilité**

### **Priorité : BASSE** - Conformité

```typescript
describe("Accessibility Tests", () => {
  it("should support keyboard navigation", () => {});
  it("should have proper ARIA labels", () => {});
  it("should maintain color contrast ratios", () => {});
  it("should support screen readers", () => {});
});
```

---

## 🚀 **Plan d'implémentation recommandé**

### **Phase 1 : Composants critiques (Semaine 1-2)**

1. `AutoSuggestInput.tsx` - Composant de recherche principal
2. `CreationCard.tsx` - Affichage des créations
3. `CommonButton.tsx` - Boutons réutilisables

### **Phase 2 : Hooks et logique (Semaine 3-4)**

1. `useAuth.ts` - Authentification
2. `useFavorites.ts` - Gestion des favoris
3. `UserContext.tsx` - État global utilisateur

### **Phase 3 : Utilitaires et contexts (Semaine 5-6)**

1. `timeUtils.ts` - Gestion du temps
2. `userUtils.ts` - Utilitaires utilisateur
3. `FavoritesContext.tsx` - État des favoris

### **Phase 4 : Tests avancés (Semaine 7-8)**

1. Tests de performance
2. Tests d'accessibilité
3. Tests d'intégration supplémentaires

---

## 📝 **Exemples de tests pratiques**

### **Test de composant avec React Testing Library**

```typescript
import { render, screen, fireEvent } from "@testing-library/react-native";
import { AutoSuggestInput } from "../components/AutoSuggestInput";

describe("AutoSuggestInput", () => {
  const mockOnChangeText = vi.fn();
  const mockOnSuggestionSelect = vi.fn();

  const defaultProps = {
    value: "",
    onChangeText: mockOnChangeText,
    placeholder: "Search...",
    suggestions: [],
    onSuggestionSelect: mockOnSuggestionSelect,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should show suggestions when typing", () => {
    const suggestions = [
      { id: "1", text: "Test suggestion" },
      { id: "2", text: "Another suggestion" },
    ];

    render(
      <AutoSuggestInput
        {...defaultProps}
        value="test"
        suggestions={suggestions}
      />
    );

    expect(screen.getByText("Test suggestion")).toBeInTheDocument();
    expect(screen.getByText("Another suggestion")).toBeInTheDocument();
  });

  it("should call onSuggestionSelect when suggestion is pressed", () => {
    const suggestions = [{ id: "1", text: "Test suggestion" }];

    render(
      <AutoSuggestInput
        {...defaultProps}
        value="test"
        suggestions={suggestions}
      />
    );

    fireEvent.press(screen.getByText("Test suggestion"));

    expect(mockOnSuggestionSelect).toHaveBeenCalledWith(suggestions[0]);
  });
});
```

### **Test de hook avec React Testing Library**

```typescript
import { renderHook, act } from "@testing-library/react-hooks";
import { useAuth } from "../hooks/useAuth";

describe("useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should start with loading true and user null", () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBe(null);
  });

  it("should sign in user successfully", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const signInResult = await result.current.signIn(
        "test@example.com",
        "password"
      );
      expect(signInResult.success).toBe(true);
    });
  });
});
```

---

## 🔧 **Configuration et outils**

### **Dépendances nécessaires**

```json
{
  "@testing-library/react-native": "^12.0.0",
  "@testing-library/react-hooks": "^8.0.0",
  "@testing-library/jest-native": "^5.0.0"
}
```

### **Configuration Vitest pour React Native**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test-utils/setup.ts"],
    globals: true,
  },
});
```

---

## 📊 **Métriques de succès**

- **Couverture globale** : Passer de 163 à 300+ tests
- **Composants** : 100% des composants principaux testés
- **Hooks** : 100% des hooks personnalisés testés
- **Contexts** : 100% des contexts testés
- **Utilitaires** : 90%+ des fonctions utilitaires testées

---

## 🎯 **Objectifs à long terme**

1. **Qualité du code** : Détecter les régressions rapidement
2. **Refactoring sécurisé** : Modifier le code en confiance
3. **Documentation vivante** : Les tests servent d'exemples d'usage
4. **Onboarding** : Nouveaux développeurs comprennent le code via les tests
5. **Maintenance** : Évolution du code plus sûre et rapide

---

_Cette documentation sera mise à jour au fur et à mesure de l'implémentation des tests recommandés._
