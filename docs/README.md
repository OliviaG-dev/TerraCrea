# Documentation TerraCréa

## 📚 Index des documents

### 🧪 Tests

- **[Résumé des tests](./TESTS_SUMMARY.md)** - Vue d'ensemble rapide
- **[Guide complet des tests](./TESTING.md)** - Documentation détaillée
- **[Guide de contribution](./CONTRIBUTING_TESTS.md)** - Comment contribuer aux tests

### 🚀 Démarrage rapide

```bash
# Lancer tous les tests
npm test

# Tests en mode développement
npm test -- --watch

# Aide personnalisée
node scripts/test-helper.js help
```

### 📊 Statistiques

- **163+ tests** au total
- **95%+ de couverture** estimée
- **7 services** entièrement testés
- **14 scénarios** d'intégration

### 🎯 Guides par niveau

#### Débutant

1. [README Tests](../src/__tests__/README.md) - Démarrage rapide
2. [Résumé des tests](./TESTS_SUMMARY.md) - Vue d'ensemble
3. [Exemples pratiques](../src/__tests__/examples/how-to-test.example.ts)

#### Intermédiaire

1. [Guide complet](./TESTING.md) - Documentation approfondie
2. Tests existants dans `src/__tests__/services/`
3. Scripts d'aide dans `scripts/`

#### Avancé

1. [Guide de contribution](./CONTRIBUTING_TESTS.md) - Contribution détaillée
2. [Architecture des mocks](./TESTING.md#stratégie-de-mocking)
3. [Tests d'intégration](./TESTING.md#tests-dintégration)

---

📖 **Commencez par le [Résumé des tests](./TESTS_SUMMARY.md) pour une vue d'ensemble rapide !**
