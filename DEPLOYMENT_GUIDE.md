# 🚀 Guide de Déploiement TerraCréa

## Déploiement sur Netlify (Recommandé - GRATUIT)

### 1. Préparation du projet ✅

- [x] Configuration Netlify ajoutée (`netlify.toml`)
- [x] Build web testée et fonctionnelle
- [x] Variables d'environnement configurées

### 2. Étapes de déploiement

#### Option A : Déploiement via GitHub (Recommandé)

1. **Pusher le code sur GitHub** (si pas déjà fait) :

   ```bash
   git add .
   git commit -m "Préparation déploiement Netlify"
   git push origin main
   ```

2. **Connecter à Netlify** :

   - Aller sur [netlify.com](https://netlify.com)
   - Se connecter avec GitHub
   - Cliquer "New site from Git"
   - Sélectionner votre repo TerraCréa
   - Netlify détectera automatiquement la configuration !

3. **Configurer les variables d'environnement** :
   - Dans Netlify Dashboard → Site settings → Environment variables
   - Ajouter :
     ```
     EXPO_PUBLIC_SUPABASE_URL=votre_url_supabase
     EXPO_PUBLIC_SUPABASE_ANON_KEY=votre_clé_supabase
     EXPO_PUBLIC_APP_URL=https://votre-app.netlify.app
     ```

#### Option B : Déploiement manuel

1. **Installer Netlify CLI** :

   ```bash
   npm install -g netlify-cli
   ```

2. **Login et déploiement** :
   ```bash
   netlify login
   netlify deploy --dir=web-build --prod
   ```

### 3. Après déploiement

✅ **Votre app sera disponible sur :** `https://votre-nom-app.netlify.app`

✅ **Fonctionnalités incluses** :

- HTTPS automatique
- Déploiement automatique à chaque push
- Domaine personnalisé gratuit
- Redirections SPA configurées

## Alternatives gratuites

### Vercel

- Connecter le repo GitHub sur [vercel.com](https://vercel.com)
- Configuration automatique
- Excellent pour React/Next.js

### Expo Web Hosting

```bash
expo publish:web
```

- URL : `https://expo.dev/@username/terracrea`

### GitHub Pages (Basic)

```bash
npm install --save-dev gh-pages
npm run build:web
npx gh-pages -d web-build
```

## 📊 Comparaison des solutions

| Solution     | Facilité   | Performance | Domaine custom | CI/CD      |
| ------------ | ---------- | ----------- | -------------- | ---------- |
| **Netlify**  | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐  | ✅ Gratuit     | ✅ Auto    |
| Vercel       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐  | ✅ Gratuit     | ✅ Auto    |
| Expo Hosting | ⭐⭐⭐⭐   | ⭐⭐⭐      | ❌             | ✅ Manuel  |
| GitHub Pages | ⭐⭐⭐     | ⭐⭐⭐      | ✅ Payant      | ✅ Actions |

## 🎯 Pour les recruteurs

Une fois déployé, vous aurez :

- ✅ **URL publique** pour démo live
- ✅ **Code source** sur GitHub
- ✅ **Performance** optimisée
- ✅ **Mobile responsive**
- ✅ **HTTPS sécurisé**

Parfait pour un portfolio professionnel ! 🚀
