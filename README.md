# FTP Studio — Déploiement Vercel

Client FTP complet dans le navigateur, hébergé sur Vercel.

## Structure
```
ftp-studio/
├── api/
│   └── ftp.js          ← proxy serverless (Node.js)
├── public/
│   └── index.html      ← interface complète
├── package.json
├── vercel.json
└── README.md
```

## Déploiement (5 minutes)

### 1. Créer un repo GitHub
- Crée un nouveau repo sur github.com
- Upload tous ces fichiers dedans

### 2. Déployer sur Vercel
- Va sur [vercel.com](https://vercel.com) → "Add New Project"
- Importe ton repo GitHub
- Vercel détecte automatiquement la config

### 3. Variable d'environnement (IMPORTANT)
Dans Vercel → Settings → Environment Variables :
```
SECRET_TOKEN = un_mot_de_passe_secret_fort
```

### 4. Utiliser l'app
Ouvre ton URL Vercel (ex: `https://ftp-studio-xxx.vercel.app`)

Remplis les champs :
- **Proxy URL** : `https://ftp-studio-xxx.vercel.app/api/ftp`
- **Token** : le `SECRET_TOKEN` défini dans Vercel
- **Host** : `ftp.metailliot.ovh` (ou ton hôte FTP)
- **User / Pass / Port** : tes identifiants FTP

## Fonctionnalités
- 📁 Arborescence complète avec navigation
- 📝 Éditeur de code (HTML, CSS, JS, PHP, Python, JSON…)
- 💾 Sauvegarde directe sur le serveur (Ctrl+S)
- ⬆ Upload par bouton ou drag & drop
- ⬇ Téléchargement de fichiers
- ✏️ Renommer / Supprimer (clic droit)
- 📂 Créer fichiers et dossiers
- 🗂 Onglets multiples

## Sécurité
Le `SECRET_TOKEN` protège l'API — sans lui, personne ne peut utiliser le proxy.
Ne jamais exposer l'URL proxy publiquement sans token.
