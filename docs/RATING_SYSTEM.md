# Système de Notation des Créations - TerraCréa

## 🎯 Vue d'ensemble

Le système de notation permet aux utilisateurs connectés de noter les créations des autres artisans avec un système d'étoiles de 1 à 5. Les créateurs ne peuvent pas noter leurs propres créations.

## ✨ Fonctionnalités

### 🔐 Accès et Permissions

- **Utilisateurs connectés** : Peuvent noter toutes les créations (sauf les leurs)
- **Créateurs** : Ne peuvent pas noter leurs propres créations
- **Utilisateurs non connectés** : Peuvent voir les notes moyennes mais pas noter

### ⭐ Système de Notation

- **Échelle** : 1 à 5 étoiles
- **Interface** : Étoiles interactives et visuelles
- **Validation** : Une seule notation par utilisateur par création
- **Mise à jour** : Possibilité de modifier sa note

### 📊 Calcul des Notes

- **Note moyenne** : Calculée automatiquement à partir de toutes les notations
- **Nombre d'avis** : Compteur mis à jour en temps réel
- **Arrondi** : Note moyenne arrondie à 1 décimale

## 🏗️ Architecture Technique

### Base de Données

```sql
-- Table user_ratings
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  creation_id UUID REFERENCES creations(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE(user_id, creation_id)
);
```

### API (RatingsApi)

- `getUserRating(creationId)` : Récupérer la note d'un utilisateur
- `saveUserRating(creationId, rating)` : Sauvegarder/mettre à jour une note
- `getCreationRatings(creationId)` : Récupérer toutes les notes d'une création

### Composants React Native

- `StarRating` : Composant d'étoiles interactives
- Intégration dans `CreationDetailScreen`
- Gestion des états et notifications

## 🚀 Installation et Configuration

### 1. Migration de Base de Données

Exécuter le fichier SQL dans Supabase :

```bash
# Copier le contenu de supabase_migrations/create_user_ratings_table.sql
# dans l'éditeur SQL de Supabase
```

### 2. Vérification des Tables

- Table `user_ratings` créée avec RLS activé
- Politiques de sécurité configurées
- Index de performance créés

### 3. Test du Système

- Se connecter avec un compte utilisateur
- Naviguer vers une création d'un autre artisan
- Tester la notation avec les étoiles
- Vérifier la mise à jour de la note moyenne

## 🔒 Sécurité

### Row Level Security (RLS)

- **Lecture** : Tous les utilisateurs peuvent voir les notes
- **Écriture** : Seuls les utilisateurs connectés peuvent créer/modifier leurs notes
- **Suppression** : Seuls les utilisateurs peuvent supprimer leurs propres notes

### Validation des Données

- **Contrainte de notation** : 1 ≤ rating ≤ 5
- **Unicité** : Un utilisateur ne peut noter qu'une fois une création
- **Vérification créateur** : Empêche l'auto-notation

## 📱 Interface Utilisateur

### États d'Affichage

1. **Non connecté** : Affichage de la note moyenne avec message de connexion
2. **Créateur** : Affichage de la note moyenne (pas de notation)
3. **Utilisateur connecté** : Interface de notation interactive

### Composants Visuels

- **Étoiles vides** (☆) : Note non attribuée
- **Étoiles pleines** (★) : Note attribuée
- **Couleurs** : Accent pour les étoiles pleines, gris pour les vides
- **Tailles** : 24px par défaut, 32px pour la notation principale

## 🧪 Tests et Validation

### Scénarios de Test

- [ ] Notation d'une création par un utilisateur connecté
- [ ] Tentative de notation par le créateur (doit être bloquée)
- [ ] Tentative de notation sans connexion (doit demander la connexion)
- [ ] Modification d'une note existante
- [ ] Calcul automatique de la note moyenne
- [ ] Mise à jour du compteur d'avis

### Validation des Données

- [ ] Note entre 1 et 5
- [ ] Unicité utilisateur-création
- [ ] Mise à jour automatique des timestamps
- [ ] Intégrité référentielle

## 🔄 Mise à Jour et Maintenance

### Mise à Jour des Notes Moyennes

- Calcul automatique lors de chaque nouvelle notation
- Mise à jour en temps réel de la table `creations`
- Gestion des erreurs et rollback en cas de problème

### Performance

- Index sur les colonnes fréquemment utilisées
- Requêtes optimisées pour les calculs de moyennes
- Mise en cache des résultats si nécessaire

## 📈 Évolutions Futures

### Fonctionnalités Possibles

- **Commentaires** : Ajouter des avis textuels aux notes
- **Photos** : Permettre l'ajout de photos dans les avis
- **Modération** : Système de modération des avis inappropriés
- **Notifications** : Alerter les créateurs des nouvelles notes
- **Statistiques** : Graphiques et analyses des tendances

### Améliorations Techniques

- **Cache Redis** : Pour améliorer les performances
- **Webhooks** : Pour les notifications en temps réel
- **API GraphQL** : Pour des requêtes plus flexibles
- **Tests automatisés** : Pour la validation continue

## 🐛 Dépannage

### Problèmes Courants

1. **Erreur de permission** : Vérifier les politiques RLS
2. **Note non sauvegardée** : Vérifier la connexion utilisateur
3. **Note moyenne incorrecte** : Vérifier les calculs et les contraintes
4. **Performance lente** : Vérifier les index de base de données

### Logs et Debug

- Vérifier les logs Supabase pour les erreurs SQL
- Utiliser les outils de développement React Native
- Tester les API directement dans Supabase

---

**Note** : Ce système est conçu pour être robuste, sécurisé et évolutif. Toute modification doit être testée en profondeur avant déploiement en production.
