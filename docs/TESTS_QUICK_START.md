# 🚀 Guide de Démarrage Rapide - Tests TerraCréa

## 🎯 **Objectif**

Implémenter rapidement des tests robustes pour tous les composants React Native en utilisant nos patterns établis.

---

## ✅ **Succès Réalisés - Semaine 1**

| Composant            | Tests | Statut      | Temps |
| -------------------- | ----- | ----------- | ----- |
| **AutoSuggestInput** | 18/18 | ✅ **100%** | 2h    |
| **CommonButton**     | 30/30 | ✅ **100%** | 3h    |
| **CommonHeader**     | 32/32 | ✅ **100%** | 2h    |

**Total : 80 tests parfaits en 7h ! 🚀**

---

## 🔧 **Installation et Configuration**

### **1. Dépendances (Déjà installées)**

```bash
# Toutes les dépendances sont déjà installées
npm test -- --run  # Pour exécuter tous les tests
```

### **2. Configuration (Déjà configurée)**

- ✅ Vitest avec jsdom
- ✅ Mocks React Native globaux
- ✅ Jest DOM matchers
- ✅ Setup des tests

---

## 📝 **Pattern de Test Standard**

### **Structure d'un Test de Composant**

```typescript
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MonComposant } from "../../components/MonComposant";

describe("MonComposant", () => {
  const mockOnPress = vi.fn();

  const defaultProps = {
    title: "Test",
    onPress: mockOnPress,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendu", () => {
    it("should render correctly", () => {
      render(<MonComposant {...defaultProps} />);
      expect(screen.getByText("Test")).toBeInTheDocument();
    });
  });

  describe("Interactions", () => {
    it("should handle press", () => {
      render(<MonComposant {...defaultProps} />);
      const element = screen.getByText("Test");
      fireEvent.click(element);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });
});
```

---

## 🎯 **Checklist de Test Complet**

### **✅ Rendu et Affichage**

- [ ] Affichage des props principales
- [ ] Gestion des props optionnelles
- [ ] Gestion des props vides/null
- [ ] Gestion des caractères spéciaux
- [ ] Gestion des textes longs

### **✅ Interactions**

- [ ] Clics et événements
- [ ] États désactivés
- [ ] États de chargement
- [ ] Gestion des erreurs
- [ ] Clics multiples

### **✅ Accessibilité**

- [ ] Rôles appropriés
- [ ] Labels d'accessibilité
- [ ] Navigation clavier
- [ ] États pour lecteurs d'écran

### **✅ Styles et Thèmes**

- [ ] Styles par défaut
- [ ] Styles personnalisés
- [ ] Variants différents
- [ ] Responsive design

### **✅ Performance**

- [ ] Rendu rapide (< 100ms)
- [ ] Re-renders efficaces (< 50ms)
- [ ] Gestion mémoire

---

## 🚨 **Problèmes Courants et Solutions**

### **1. Props Inexistantes**

```typescript
// ❌ Erreur : prop 'type' n'existe pas
<CommonButton type="primary" />

// ✅ Solution : utiliser la bonne prop
<CommonButton variant="primary" />
```

### **2. Rôles d'Accessibilité Manquants**

```typescript
// ❌ Erreur : rôle 'banner' n'existe pas dans les mocks
screen.getByRole("banner");

// ✅ Solution : utiliser data-testid ou text
screen.getByTestId("header");
screen.getByText("Titre");
```

### **3. Éléments Multiples**

```typescript
// ❌ Erreur : plusieurs éléments avec le même sélecteur
screen.getByTestId("view");

// ✅ Solution : utiliser getAllBy et sélectionner
const elements = screen.getAllByTestId("view");
const mainElement = elements[0];
```

---

## 📚 **Exemples de Tests par Catégorie**

### **Test d'Affichage**

```typescript
it("should display title correctly", () => {
  render(<MonComposant title="Test" />);
  expect(screen.getByText("Test")).toBeInTheDocument();
});
```

### **Test d'Interaction**

```typescript
it("should call onPress when clicked", () => {
  const mockOnPress = vi.fn();
  render(<MonComposant onPress={mockOnPress} />);

  const button = screen.getByText("Test");
  fireEvent.click(button);

  expect(mockOnPress).toHaveBeenCalledTimes(1);
});
```

### **Test d'État**

```typescript
it("should show loading state", () => {
  render(<MonComposant loading={true} />);
  expect(screen.getByText("...")).toBeInTheDocument();
});
```

### **Test d'Accessibilité**

```typescript
it("should have proper accessibility", () => {
  render(<MonComposant accessibilityLabel="Test" />);
  const element = screen.getByRole("button");
  expect(element).toHaveAttribute("aria-label", "Test");
});
```

---

## 🎉 **Bonnes Pratiques Établies**

### **1. Organisation des Tests**

- **Groupes logiques** : Rendu, Interactions, États, Accessibilité
- **Tests isolés** : Chaque test teste une seule fonctionnalité
- **Noms descriptifs** : "should handle empty title gracefully"

### **2. Gestion des Mocks**

- **Mocks globaux** : Configurés dans `vitest.config.ts`
- **Mocks locaux** : Uniquement si nécessaire
- **Nettoyage** : `vi.clearAllMocks()` dans `beforeEach`

### **3. Assertions**

- **Assertions positives** : Vérifier ce qui doit être présent
- **Assertions négatives** : Vérifier ce qui ne doit pas être présent
- **Matchers expressifs** : `toBeInTheDocument()`, `toHaveAttribute()`

---

## 📊 **Métriques de Qualité**

### **Objectifs de Couverture**

- **Composants** : 100% des props et interactions
- **Hooks** : 100% des états et effets
- **Contexts** : 100% des valeurs et mises à jour
- **Utilitaires** : 100% des cas d'usage

### **Objectifs de Performance**

- **Rendu initial** : < 100ms
- **Re-renders** : < 50ms
- **Tests complets** : < 2s par composant

---

## 🚀 **Prochaines Étapes**

### **Semaine 2 : Composants Métier**

1. **CreationCard** (60+ tests) - Composant critique
2. **FloatingButtons** (30+ tests) - Actions flottantes
3. **Objectif** : Atteindre 300+ tests

### **Semaine 3 : Hooks et Logique**

1. **useAuth** (15+ tests) - Authentification
2. **useFavorites** (15+ tests) - Gestion favoris
3. **Objectif** : 330+ tests

---

## 💡 **Conseils d'Expert**

### **1. Commencer Simple**

- Testez d'abord le rendu de base
- Ajoutez les interactions progressivement
- Complexifiez les tests étape par étape

### **2. Tester le Comportement Réel**

- Adaptez les tests à l'implémentation
- Évitez de forcer des comportements
- Utilisez les mocks appropriés

### **3. Maintenir la Qualité**

- Exécutez les tests régulièrement
- Corrigez les régressions immédiatement
- Documentez les patterns utiles

---

## 🎯 **Objectif Final**

**En 4 semaines** : Une application TerraCréa avec **350+ tests**, permettant un développement plus rapide, plus sûr et plus maintenable.

---

_Guide mis à jour : Semaine 1, Jour 3 - 80 tests parfaits implémentés ! 🚀_
