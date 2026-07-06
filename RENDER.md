# 🚀 BeluGANG Monolith — Déploiement Render 24/7

## 📋 Résumé du Projet

Le **BeluGANG Monolith** regroupe **4 bots Discord** dans un seul service pour économiser les ressources.

### 🤖 Les 4 Bots Inclus

| Bot | Fonction | Commandes Clés |
|-----|----------|-----------------|
| **Zeepin** | Modération + Auto-ban | `/warn`, `/clear`, `/rules`, `/add-prefix`, `/add-command` |
| **BeluGANG Events** | Événements auto + Belubecks | `/event-create`, `/give-belubecks`, `/belubecks-balance` |
| **Honeypot** | Piège anti-raid | Crée `#honeypot` → Ban immédiat si quelqu'un écrit |
| **CarlBot** | Modération avancée | `/ban`, `/kick`, `/mute` |

---

## 🛠️ Configuration sur Render

### 1. Créer un nouveau projet
1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Clique sur **"New"** → **"Blueprint"** (ou "Background Worker")
3. Connecte ton repo GitHub `belugagang-monolith-v2`

### 2. Ajouter les Variables d'Environnement
Render utilisera automatiquement le fichier `render.yaml` pour configurer le service. Tu **DOIS** remplir les valeurs secrètes dans le dashboard Render (onglet **Environment**) pour que les bots puissent se connecter :

```
ZEEPIN_TOKEN=...
EVENTS_TOKEN=...
HONEYPOT_TOKEN=...
CARLBOT_TOKEN=...
BOT_OWNER_ID=...
BOT_CREATOR_ID=...
```

> 💡 **Note** : Si aucune variable n'est configurée, le Monolithe restera en attente sans crasher pour te laisser le temps de les ajouter. Une fois ajoutées, Render redémarre automatiquement le service.

> ⚠️ **Les tokens ne doivent jamais être committés dans le repo.**

### 3. Déployer
Render détecte le `render.yaml` et lance les 4 bots en tant que **Background Worker**.

---

## 📊 Architecture

```
belugagang-monolith-v2/
├── index.js                    # Lanceur principal (fork des 4 bots)
├── package.json                # Dépendances
├── render.yaml                 # Config Render (Blueprint)
├── .env.example                # Template des variables d'environnement
├── bots/
│   ├── zeepin/                 # Bot Modération (Client ID: 1523413598024761374)
│   ├── belugagang-events/      # Bot Événements + Belubecks (Client ID: 1523414380438491157)
│   ├── honeypot/               # Bot Piège Anti-Raid (Client ID: 1523436409937985576)
│   └── carlbot/                # Bot Modération Avancée (Client ID: 1523443499666640986)
```

---

## 🔄 Redémarrage & Monitoring

Render redémarre automatiquement les bots en cas de crash.

Pour vérifier que tout tourne :
1. Va dans l'onglet **"Logs"** de ton service sur Render.
2. Cherche les messages `✅ Connecté en tant que` pour chaque bot.

---

**Créé avec ❤️ pour BeluGANG**
