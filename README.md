# 🎮 BeluGANG Monolith v2.0

> 4 bots Discord dans un seul service Railway + Dashboard style Carl-Bot

---

## 📦 Structure du projet

```
belugagang-monolith/
├── index.js                  # Point d'entrée — lance les 4 bots
├── package.json
├── railway.toml              # Config Railway (auto-restart)
├── .env.example              # Variables d'environnement
│
├── bots/
│   ├── zeepin/               # 🤖 Remake Zeppelin FR (14 commandes)
│   │   ├── index.js
│   │   └── package.json
│   ├── belugagang-events/    # 📅 Événements, giveaways, votes (8 cmds)
│   │   ├── index.js
│   │   └── package.json
│   ├── honeypot/             # 🍯 Injection H24 dans #honeypot (3 cmds)
│   │   ├── index.js
│   │   └── package.json
│   └── carlbot/              # 🛡️ Auto-mod, rôles réactifs (12 cmds)
│       ├── index.js
│       └── package.json
│
├── backend/
│   ├── server.js             # API Express + Discord OAuth2
│   └── package.json
│
└── dashboard/                # React/Vite — Dashboard style Carl-Bot
    ├── src/
    │   ├── App.jsx
    │   ├── components/
    │   │   └── Sidebar.jsx
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Bots.jsx
    │       ├── Moderation.jsx
    │       ├── Events.jsx
    │       └── Honeypot.jsx
    └── vite.config.js
```

---

## 🤖 Les 4 Bots

| Bot | Commandes | Rôle |
|-----|-----------|------|
| **Zeepin** | `/ping` `/ban` `/kick` `/mute` `/unmute` `/clear` `/userinfo` `/serverinfo` `/warn` `/warns` `/clearwarns` `/lock` `/unlock` `/slowmode` | Remake Zeppelin FR — modération complète |
| **BeluGANG Events** | `/event-create` `/event-list` `/event-delete` `/giveaway` `/giveaway-end` `/announce` `/vote` `/poll` | Gestion des événements du serveur |
| **Honeypot** | `/honeypot-status` `/honeypot-inject` `/honeypot-config` | Injection H24 du code source des 4 bots dans #honeypot |
| **CarlBot** | `/warn` `/warns` `/clearwarns` `/ban` `/kick` `/mute` `/reactionrole` `/automod` `/log` `/prefix` `/help` `/ping` | Copie Carl-Bot — auto-mod + rôles réactifs |

---

## 🚀 Démarrage rapide

### 1. Cloner et installer

```bash
git clone https://github.com/mynameeeeeeeeeeeeeeee-hue/belugagang-monolith
cd belugagang-monolith
npm install
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
# Remplir les tokens dans .env
```

### 3. Lancer le monolithe

```bash
npm start
# Lance les 4 bots en parallèle avec auto-restart
```

### 4. Lancer le Dashboard

```bash
# Terminal 1 — Backend
cd backend && node server.js

# Terminal 2 — Frontend
cd dashboard && npm install && npm run dev
```

---

## 🌐 Dashboard

Le Dashboard style Carl-Bot permet de :

- **Tableau de bord** — Statistiques globales (bots en ligne, commandes, logs)
- **Bots** — État, uptime, redémarrage à distance
- **Modération** — Logs d'actions, gestion des warns
- **Événements** — Création et gestion des événements Discord
- **Honeypot** — Statut, historique, injection forcée

**Connexion** : Discord OAuth2 ou Mode démo

---

## 🚂 Déploiement Railway

1. Créer un nouveau projet Railway
2. Connecter le repo GitHub `belugagang-monolith`
3. Ajouter les variables d'environnement (tokens des 4 bots)
4. Railway détecte automatiquement `railway.toml` → `node index.js`

**Variables Railway à configurer :**
```
ZEEPIN_TOKEN=...
ZEEPIN_CLIENT_ID=...
EVENTS_TOKEN=...
EVENTS_CLIENT_ID=...
HONEYPOT_TOKEN=...
HONEYPOT_CLIENT_ID=...
CARLBOT_TOKEN=...
CARLBOT_CLIENT_ID=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
JWT_SECRET=...
```

---

## 🍯 Honeypot — Fonctionnement

Le bot Honeypot injecte **toutes les 24h** le code source complet des 4 bots dans le salon `#honeypot` du serveur Discord. Cela permet à la communauté de voir en temps réel comment les bots fonctionnent.

**Injection forcée** : `/honeypot-inject` ou via le Dashboard → Honeypot → "Forcer l'injection"

---

## 📝 Licence

MIT — BeluGANG Events 2026
