// ============================================================
// Bot Zeepin — BeluGANG Events
// NOUVEAUTÉS :
// • Ban auto @everyone, liens et images (sauf owner)
// • /clear, /warn, /rules, /add-prefix (par serveur)
// • /add-command (création dynamique de commandes — owner du bot)
// OPTIMISATION : deferReply pour éviter "Unknown Interaction"
// ============================================================
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, REST, Routes } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildBans,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

const PREFIX = '!';
const TOKEN = process.env.ZEEPIN_TOKEN || process.env.BOT_TOKEN;
const CLIENT_ID = process.env.ZEEPIN_CLIENT_ID || process.env.CLIENT_ID || '';
const BOT_OWNER_ID = process.env.BOT_OWNER_ID || ''; 

// ─── Stockage en mémoire ──────────────────────────────────────────────────────
const warns = new Map(); 
const prefixes = new Map(); 
const customCommands = new Map(); 
const serverRules = new Map(); 

// ─── Détection de liens ───────────────────────────────────────────────────────
const LINK_REGEX = /https?:\/\/[^\s]+|discord\.gg\/[^\s]+|discord\.com\/invite\/[^\s]+/i;

// ─── Détection d'images ──────────────────────────────────────────────────────
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|bmp|svg|tiff)(\?.*)?$/i;
const IMAGE_URL_REGEX = /https?:\/\/[^\s]+\.(png|jpg|jpeg|gif|webp|bmp)(\?[^\s]*)?/i;

function mentionsEveryone(message) {
  return message.mentions.everyone;
}

function containsLink(message) {
  return LINK_REGEX.test(message.content);
}

function containsImage(message) {
  if (message.attachments.some(a => IMAGE_EXTENSIONS.test(a.name || '') || (a.contentType && a.contentType.startsWith('image/')))) {
    return true;
  }
  if (IMAGE_URL_REGEX.test(message.content)) {
    return true;
  }
  return false;
}

// ─── Slash Commands ───────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Vérifie la latence du bot'),
  new SlashCommandBuilder().setName('info').setDescription('Infos sur le serveur BeluGANG Events'),
  new SlashCommandBuilder().setName('help').setDescription('Liste toutes les commandes disponibles'),
  new SlashCommandBuilder()
    .setName('say')
    .setDescription('Fait parler le bot')
    .addStringOption(opt => opt.setName('message').setDescription('Le message à envoyer').setRequired(true)),
  new SlashCommandBuilder()
    .setName('embed')
    .setDescription('Envoie un embed stylé')
    .addStringOption(opt => opt.setName('titre').setDescription('Titre de l\'embed').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Description').setRequired(true)),
  new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à kick').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(false)),
  new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à ban').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison').setRequired(false)),
  new SlashCommandBuilder()
    .setName('mute')
    .setDescription('Mute un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à mute').setRequired(true))
    .addNumberOption(opt => opt.setName('duree').setDescription('Durée en minutes').setRequired(false)),
  new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Supprime des messages')
    .addIntegerOption(opt => opt.setName('nombre').setDescription('Nombre de messages (1-100)').setRequired(true)),
  new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Avertir un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre à avertir').setRequired(true))
    .addStringOption(opt => opt.setName('raison').setDescription('Raison de l\'avertissement').setRequired(true)),
  new SlashCommandBuilder()
    .setName('warns')
    .setDescription('Affiche les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre').setRequired(false)),
  new SlashCommandBuilder()
    .setName('clearwarns')
    .setDescription('Supprime tous les avertissements d\'un membre')
    .addUserOption(opt => opt.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder()
    .setName('rules')
    .setDescription('Affiche les règles du serveur'),
  new SlashCommandBuilder()
    .setName('set-rules')
    .setDescription('Définit les règles du serveur')
    .addStringOption(opt => opt.setName('regles').setDescription('Les règles (séparées par \\n)').setRequired(true)),
  new SlashCommandBuilder()
    .setName('add-prefix')
    .setDescription('Change le préfixe du bot pour ce serveur')
    .addStringOption(opt => opt.setName('prefix').setDescription('Nouveau préfixe').setRequired(true)),
  new SlashCommandBuilder()
    .setName('add-command')
    .setDescription('Crée une commande personnalisée (Owner du bot uniquement)')
    .addStringOption(opt => opt.setName('name').setDescription('Nom de la commande').setRequired(true))
    .addStringOption(opt => opt.setName('code').setDescription('Code/réponse de la commande').setRequired(true))
    .addStringOption(opt => opt.setName('description').setDescription('Description').setRequired(false)),
  new SlashCommandBuilder().setName('userinfo').setDescription('Infos sur un utilisateur')
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur').setRequired(false)),
  new SlashCommandBuilder().setName('serverinfo').setDescription('Infos détaillées sur le serveur'),
  new SlashCommandBuilder().setName('avatar').setDescription('Affiche l\'avatar d\'un utilisateur')
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur').setRequired(false)),
  new SlashCommandBuilder().setName('8ball').setDescription('Pose une question à la boule magique')
    .addStringOption(opt => opt.setName('question').setDescription('Ta question').setRequired(true)),
  new SlashCommandBuilder().setName('poll').setDescription('Crée un sondage')
    .addStringOption(opt => opt.setName('question').setDescription('Question du sondage').setRequired(true)),
].map(cmd => cmd.toJSON());

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`[Zeepin] ✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Protection BeluGANG + Warns 🛡️', { type: 3 });

  if (CLIENT_ID) {
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('[Zeepin] ✅ Slash commands enregistrées');
    } catch (e) {
      console.error('[Zeepin] Erreur slash commands:', e.message);
    }
  }
});

// ─── Auto-modération ─────────────────────────────────────────────────────────
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  if (message.author.id === message.guild.ownerId) return;
  if (message.member && message.member.permissions.has(PermissionsBitField.Flags.Administrator)) return;

  let reason = null;
  if (mentionsEveryone(message)) reason = 'Utilisation de @everyone ou @here';
  else if (containsLink(message)) reason = 'Envoi d\'un lien';
  else if (containsImage(message)) reason = 'Envoi d\'une image';

  if (!reason) return;

  try {
    await message.delete().catch(() => {});
    const warnEmbed = new EmbedBuilder()
      .setTitle('🔨 Sanction automatique')
      .setDescription(`<@${message.author.id}> a été **banni automatiquement**.`)
      .addFields({ name: 'Raison', value: reason })
      .setColor(0xED4245);
    await message.channel.send({ embeds: [warnEmbed] }).catch(() => {});
    await message.member.ban({ reason: `[Zeepin Auto-Ban] ${reason}` });
  } catch (e) {}
});

// ─── Interaction Handler ──────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // 🛡️ PROTECTION : deferReply pour éviter les timeouts (Unknown Interaction)
  try {
    await interaction.deferReply({ ephemeral: false }).catch(() => {});
  } catch (e) {
    console.error('[Zeepin] Erreur deferReply:', e.message);
    return;
  }

  const { commandName } = interaction;

  try {
    if (commandName === 'ping') {
      await interaction.editReply({ content: `🏓 Pong ! Latence : **${client.ws.ping}ms**` });
    }

    else if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setTitle('📋 Commandes Zeepin')
        .setColor(0x5865F2)
        .addFields(
          { name: '🔧 Utilitaires', value: '`/ping` `/info` `/help` `/say` `/embed` `/8ball` `/poll`' },
          { name: '👤 Utilisateurs', value: '`/userinfo` `/avatar` `/serverinfo`' },
          { name: '🔨 Modération', value: '`/kick` `/ban` `/mute` `/clear` `/warn` `/warns` `/clearwarns`' },
          { name: '📋 Serveur', value: '`/rules` `/set-rules` `/add-prefix`' },
          { name: '🛡️ Auto-mod', value: 'Ban auto : @everyone, Liens, Images' },
        );
      await interaction.editReply({ embeds: [embed] });
    }

    else if (commandName === 'clear') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
        return interaction.editReply({ content: '❌ Permission insuffisante.' });
      }
      const nb = Math.min(interaction.options.getInteger('nombre'), 100);
      const deleted = await interaction.channel.bulkDelete(nb, true);
      await interaction.editReply({ content: `✅ **${deleted.size}** messages supprimés.` });
    }

    else if (commandName === 'warn') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
        return interaction.editReply({ content: '❌ Permission insuffisante.' });
      }
      const user = interaction.options.getUser('membre');
      const raison = interaction.options.getString('raison');
      const guildId = interaction.guild.id;

      if (!warns.has(guildId)) warns.set(guildId, new Map());
      const guildWarns = warns.get(guildId);
      if (!guildWarns.has(user.id)) guildWarns.set(user.id, []);
      guildWarns.get(user.id).push({ reason: raison, date: new Date(), modId: interaction.user.id });

      const embed = new EmbedBuilder()
        .setTitle('⚠️ Avertissement')
        .setDescription(`${user.tag} a reçu un avertissement pour : ${raison}`)
        .setColor(0xFFA500);
      await interaction.editReply({ embeds: [embed] });
    }

    else if (commandName === 'rules') {
      const rules = serverRules.get(interaction.guild.id) || 'Aucune règle définie.';
      const embed = new EmbedBuilder().setTitle('📋 Règles').setDescription(rules).setColor(0x5865F2);
      await interaction.editReply({ embeds: [embed] });
    }

    else if (commandName === 'set-rules') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.editReply({ content: '❌ Permission insuffisante.' });
      }
      const rules = interaction.options.getString('regles').replace(/\\n/g, '\n');
      serverRules.set(interaction.guild.id, rules);
      await interaction.editReply({ content: '✅ Règles mises à jour !' });
    }

    else if (commandName === 'add-prefix') {
      if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
        return interaction.editReply({ content: '❌ Permission insuffisante.' });
      }
      const prefix = interaction.options.getString('prefix');
      prefixes.set(interaction.guild.id, prefix);
      await interaction.editReply({ content: `✅ Préfixe changé en : \`${prefix}\`` });
    }

    else if (commandName === 'add-command') {
      if (interaction.user.id !== BOT_OWNER_ID) {
        return interaction.editReply({ content: '❌ Seul le propriétaire du bot peut faire ça.' });
      }
      const name = interaction.options.getString('name').toLowerCase();
      const code = interaction.options.getString('code');
      if (!customCommands.has(interaction.guild.id)) customCommands.set(interaction.guild.id, {});
      customCommands.get(interaction.guild.id)[name] = { code };
      await interaction.editReply({ content: `✅ Commande \`${name}\` créée !` });
    }

    else if (commandName === 'userinfo') {
      const user = interaction.options.getUser('utilisateur') || interaction.user;
      const embed = new EmbedBuilder().setTitle(`👤 ${user.tag}`).setThumbnail(user.displayAvatarURL()).setColor(0x5865F2);
      await interaction.editReply({ embeds: [embed] });
    }

    else {
      await interaction.editReply({ content: 'Commande en cours de développement...' });
    }

  } catch (e) {
    console.error(`[Zeepin] Erreur commande ${commandName}:`, e.message);
    await interaction.editReply({ content: `❌ Une erreur est survenue : ${e.message}` }).catch(() => {});
  }
});

client.on('error', err => console.error('[Zeepin] Erreur:', err));
process.on('unhandledRejection', err => console.error('[Zeepin] Unhandled:', err));

client.login(TOKEN);
