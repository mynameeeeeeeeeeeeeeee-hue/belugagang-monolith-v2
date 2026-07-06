# 🚀 BeluGANG Monolith — Déploiement Railway 24/7

## 📋 Résumé du Projet

Le **BeluGANG Monolith** regroupe **4 bots Discord** dans un seul service Railway pour économiser les slots.

### 🤖 Les 4 Bots Inclus

| Bot | Fonction | Commandes Clés |
|-----|----------|-----------------|
| **Zeepin** | Modération + Auto-ban | `/warn`, `/clear`, `/rules`, `/add-prefix`, `/add-command` |
| **BeluGANG Events** | Événements auto + Belubecks | `/event-create`, `/give-belubecks`, `/belubecks-balance` |
| **Honeypot** | Piège anti-raid | Crée `#honeypot` → Ban immédiat si quelqu'un écrit |
| **CarlBot** | Modération avancée | `/ban`, `/kick`, `/mute` |

---

## 🛠️ Configuration sur Railway

### 1. Créer un nouveau projet
1. Va sur [railway.app](https://railway.app)
2. Clique sur **"New Project"** → **"Deploy from GitHub"**
3. Sélectionne le repo `belugagang-monolith`

### 2. Ajouter les Variables d'Environnement
Dans l'onglet **"Variables"** de ton service, ajoute :

```
ZEEPIN_TOKEN=MTUyMzQxMzU5ODAyNDc2MTM3NA.GHW44T.M6O8NcbueeKQwGH-AwRZBUouI3R6VTNIVkiLx8
ZEEPIN_CLIENT_ID=1523413598024761374

EVENTS_TOKEN=MTUyMzQxNDM4MDQzODQ5MTE1Nw.GwZkMo.bYyI0xjBZq90ehmdU2q3foVhL-sPVQfxQRsrS0
EVENTS_CLIENT_ID=1523414380438491157

HONEYPOT_TOKEN=MTUyMzQzNjQwOTkzNzk4NTU3Ng.GTX6hn.S4JAFZ55ZPfzLkgNuEScD9PMgM-JosoVP_uxR0
HONEYPOT_CLIENT_ID=1523436409937985576

CARLBOT_TOKEN=MTUyMzQ0MzQ5OTY2NjY0MDk4Ng.GmsuYD.JeQLG3GiglEMb1Emv7q1BonfE-2IlJHN6CnIUU
CARLBOT_CLIENT_ID=1523443499666640986

BOT_OWNER_ID=<TON_ID_DISCORD>
BOT_CREATOR_ID=<TON_ID_DISCORD>
```

### 3. Déployer
Railway détecte automatiquement le `railway.toml` et lance les 4 bots. C'est tout ! 🎉

---

## 📊 Architecture

```
belugagang-monolith/
├── index.js                    # Lanceur principal (fork des 4 bots)
├── package.json                # Dépendances
├── railway.toml                # Config Railway
├── bots/
│   ├── zeepin/                 # Bot Modération
│   ├── belugagang-events/      # Bot Événements + Belubecks
│   ├── honeypot/               # Bot Piège Anti-Raid
│   └── carlbot/                # Bot Modération Avancée
├── dashboard/                  # React/Vite (optionnel)
└── backend/                    # API tRPC (optionnel)
```

---

## 🎯 Fonctionnalités Principales

### ✅ Zeepin
- **Auto-ban** : @everyone, liens, images (sauf owner)
- **Système de warns** : `/warn`, `/warns`, `/clearwarns`
- **Règles du serveur** : `/rules`, `/set-rules`
- **Préfixes personnalisés** : `/add-prefix` (par serveur)
- **Commandes dynamiques** : `/add-command` (owner du bot)

### ✅ BeluGANG Events
- **Événements auto** : Toutes les 5 minutes dans #events
- **Système Belubecks** : `/give-belubecks`, `/belubecks-balance`, `/belubecks-top`
- **Giveaways** : `/giveaway`
- **Annonces** : `/announce`
- **Votes** : `/vote`

### ✅ Honeypot
- **Création auto** du salon `#honeypot` à l'invitation
- **Ban immédiat** de quiconque écrit dedans
- **Suppression du message** instantanée
- **Log du ban** temporaire dans le salon

### ✅ CarlBot
- **Ban/Kick/Mute** : Modération complète
- **Logs** : Suivi des actions
- **Rôles réactifs** : Réactions = rôles

---

## 🔄 Redémarrage & Monitoring

Railway redémarre automatiquement les bots en cas de crash grâce au système de **auto-restart** du monolithe.

Pour vérifier que tout tourne :
1. Va dans l'onglet **"Logs"** de ton service Railway
2. Cherche les messages `✅ Connecté en tant que` pour chaque bot

---

## 📞 Support

Si un bot crash :
1. Vérifie les **Logs** sur Railway
2. Assure-toi que les tokens sont valides
3. Redémarre le service manuellement si besoin

---

**Créé avec ❤️ pour BeluGANG**
