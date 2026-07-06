# 🚀 Guide Complet de Déploiement BeluGANG Monolith

## 📌 Vue d'ensemble

Ce projet contient **4 bots Discord** dans un seul service Railway pour économiser les slots gratuits.

### ✅ Ce qui est inclus

- ✅ **Zeepin** — Bot de modération avec auto-ban, warns, règles, préfixes personnalisés
- ✅ **BeluGANG Events** — Bot d'événements auto + système Belubecks (monnaie)
- ✅ **Honeypot** — Piège anti-raid (ban immédiat si quelqu'un écrit dans #honeypot)
- ✅ **CarlBot** — Modération avancée (ban, kick, mute)
- ✅ **Dashboard React/Vite** — Interface de gestion (optionnel)
- ✅ **API Backend** — Endpoints pour le Dashboard (optionnel)

---

## 🔧 Étape 1 : Préparation Locale

### 1.1 Cloner ou télécharger le projet

```bash
# Option 1 : Via GitHub
git clone https://github.com/mynameeeeeeeeeeeeeeee-hue/belugagang-monolith.git
cd belugagang-monolith

# Option 2 : Via ZIP
unzip belugagang-railway-FINAL.zip
cd belugagang-monolith
```

### 1.2 Installer les dépendances

```bash
npm install
```

### 1.3 Configurer les variables d'environnement

Crée un fichier `.env` à la racine :

```env
# Zeepin
ZEEPIN_TOKEN=MTUyMzQxMzU5ODAyNDc2MTM3NA.GHW44T.M6O8NcbueeKQwGH-AwRZBUouI3R6VTNIVkiLx8
ZEEPIN_CLIENT_ID=1523413598024761374

# BeluGANG Events
EVENTS_TOKEN=MTUyMzQxNDM4MDQzODQ5MTE1Nw.GwZkMo.bYyI0xjBZq90ehmdU2q3foVhL-sPVQfxQRsrS0
EVENTS_CLIENT_ID=1523414380438491157

# Honeypot
HONEYPOT_TOKEN=MTUyMzQzNjQwOTkzNzk4NTU3Ng.GTX6hn.S4JAFZ55ZPfzLkgNuEScD9PMgM-JosoVP_uxR0
HONEYPOT_CLIENT_ID=1523436409937985576

# CarlBot
CARLBOT_TOKEN=MTUyMzQ0MzQ5OTY2NjY0MDk4Ng.GmsuYD.JeQLG3GiglEMb1Emv7q1BonfE-2IlJHN6CnIUU
CARLBOT_CLIENT_ID=1523443499666640986

# Owner du bot (ton ID Discord)
BOT_OWNER_ID=123456789012345678
BOT_CREATOR_ID=123456789012345678
```

### 1.4 Tester localement

```bash
npm start
```

Tu devrais voir dans la console :

```
🚀 Démarrage du Monolithe BeluGANG Events...
[Monolith] 🤖 Lancement de Zeepin...
[Monolith] 🤖 Lancement de BeluGANG Events...
[Monolith] 🤖 Lancement de Honeypot...
[Monolith] 🤖 Lancement de CarlBot...
[Monolith] ✅ 4/4 bots lancés.
```

---

## 🚀 Étape 2 : Déploiement sur Railway

### 2.1 Créer un compte Railway

1. Va sur [railway.app](https://railway.app)
2. Clique sur **"Sign in with GitHub"**
3. Autorise Railway à accéder à tes repos

### 2.2 Créer un nouveau projet

1. Clique sur **"New Project"**
2. Sélectionne **"Deploy from GitHub"**
3. Choisis le repo `belugagang-monolith`

### 2.3 Configurer les variables d'environnement

1. Dans Railway, va à l'onglet **"Variables"**
2. Ajoute toutes les variables du fichier `.env` (voir section 1.3)
3. Clique sur **"Deploy"**

Railway va automatiquement :
- Détecter le `railway.toml`
- Installer les dépendances
- Lancer les 4 bots

### 2.4 Vérifier le déploiement

1. Va à l'onglet **"Logs"**
2. Cherche les messages :
   ```
   [Zeepin] ✅ Connecté en tant que Zeeplin (Forma Trizix)#6119
   [BeluGANG Events] ✅ Connecté en tant que BELUGANG Events2538#1272
   [Honeypot] ✅ Connecté en tant que Honeypot#2247
   [CarlBot] ✅ Connecté en tant que Carl-bot (trizix édition)#4100
   ```

Si tu vois ça, **c'est gagné !** 🎉

---

## 📊 Fonctionnalités Détaillées

### 🛡️ Zeepin — Modération

| Commande | Description |
| --- | --- |
| `/ping` | Vérifie la latence du bot |
| `/warn <user> <raison>` | Avertir un utilisateur |
| `/warns [user]` | Voir les avertissements |
| `/clearwarns <user>` | Supprimer tous les warns |
| `/clear <nombre>` | Supprimer des messages (1-100) |
| `/rules` | Afficher les règles du serveur |
| `/set-rules <regles>` | Définir les règles |
| `/add-prefix <prefix>` | Changer le préfixe (par serveur) |
| `/add-command <name> <code>` | Créer une commande personnalisée (Owner) |
| `/ban <user> [raison]` | Bannir un utilisateur |
| `/kick <user> [raison]` | Expulser un utilisateur |
| `/mute <user> [duree]` | Mute un utilisateur |

**Auto-modération** :
- Ban immédiat si quelqu'un envoie `@everyone` ou `@here`
- Ban immédiat si quelqu'un envoie un lien
- Ban immédiat si quelqu'un envoie une image
- *(Exemption : Owner du serveur et Administrateurs)*

---

### 🎉 BeluGANG Events — Événements & Belubecks

| Commande | Description |
| --- | --- |
| `/event-create <nom> <desc> <date>` | Créer un événement |
| `/event-list` | Lister les événements |
| `/event-join <id>` | Rejoindre un événement |
| `/event-auto` | Forcer l'envoi d'un auto-event |
| `/give-belubecks <user> <montant>` | Donner des Belubecks (Creator) |
| `/belubecks-balance` | Voir son solde |
| `/belubecks-top` | Top 10 des Belubecks |
| `/giveaway <prix> <duree> [gagnants]` | Lancer un giveaway |
| `/announce <message> [mention]` | Faire une annonce |
| `/vote <question> <opt1> <opt2> [opt3]` | Lancer un vote |

**Auto-événements** :
- Tous les 5 minutes, un événement aléatoire est envoyé dans #events

---

### 🍯 Honeypot — Piège Anti-Raid

**Comportement** :
1. À l'invitation, crée automatiquement le salon `#honeypot`
2. Interdit à @everyone d'y écrire
3. **Ban immédiat** de quiconque écrit dedans
4. Supprime le message instantanément
5. Affiche un log temporaire du ban

**Utilité** : Attraper les raiders/spammeurs qui testent les salons

---

### 🤖 CarlBot — Modération Avancée

| Commande | Description |
| --- | --- |
| `/ban <user> [raison]` | Bannir un utilisateur |
| `/kick <user> [raison]` | Expulser un utilisateur |
| `/mute <user> [duree]` | Mute un utilisateur |
| `/userinfo [user]` | Infos sur un utilisateur |
| `/serverinfo` | Infos sur le serveur |
| `/avatar [user]` | Afficher l'avatar d'un utilisateur |

---

## 🔄 Maintenance & Redémarrage

### Redémarrer les bots

Sur Railway, clique simplement sur le bouton **"Redeploy"** pour redémarrer tous les bots en même temps.

### Mettre à jour le code

1. Fais tes changements localement
2. Commit et push sur GitHub
3. Railway redéploie automatiquement

### Vérifier les logs

1. Va à l'onglet **"Logs"** de Railway
2. Cherche les erreurs ou les messages de connexion

---

## 🆘 Dépannage

### Les bots ne se connectent pas

**Cause** : Tokens invalides ou manquants

**Solution** :
1. Vérifie que tous les tokens sont dans les **Variables** de Railway
2. Assure-toi que les tokens ne sont pas expirés
3. Redéploie le service

### Les commandes ne fonctionnent pas

**Cause** : Les bots n'ont pas les permissions

**Solution** :
1. Donne le rôle **Administrateur** aux bots
2. Assure-toi que le rôle des bots est au-dessus des autres rôles
3. Réinvite les bots avec les bons scopes

### Honeypot ne crée pas le salon

**Cause** : Permissions insuffisantes

**Solution** :
1. Donne la permission **"Gérer les salons"** au bot Honeypot
2. Expulse et réinvite le bot
3. Redéploie sur Railway

---

## 📞 Support

Pour toute question ou problème, consulte les logs Railway ou contacte l'équipe BeluGANG.

---

**Créé avec ❤️ pour BeluGANG Events**
