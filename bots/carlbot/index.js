// ============================================================
// Bot CarlBot (Copie) — BeluGANG Events
// Modération avancée, auto-mod, logs, rôles réactifs
// ============================================================
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildBans,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember],
});

const TOKEN = process.env.CARLBOT_TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CARLBOT_CLIENT_ID || process.env.CLIENT_ID || '';

// Stockage en mémoire
const warns = new Map(); // userId -> [{ reason, date, modId }]
const reactionRoles = new Map(); // messageId -> { emoji -> roleId }
const automodConfig = new Map(); // guildId -> config
const modLogs = new Map(); // guildId -> channelId

const commands = [
  // Modération
  new SlashCommandBuilder().setName('warn').setDescription('Avertit un membre')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('raison').setDescription('Raison').setRequired(true)),
  new SlashCommandBuilder().setName('warns').setDescription('Voir les warns d\'un membre')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder().setName('clearwarns').setDescription('Efface les warns d\'un membre')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true)),
  new SlashCommandBuilder().setName('slowmode').setDescription('Active le slowmode')
    .addIntegerOption(o => o.setName('secondes').setDescription('Délai en secondes (0 = désactiver)').setRequired(true)),
  new SlashCommandBuilder().setName('lock').setDescription('Verrouille un salon'),
  new SlashCommandBuilder().setName('unlock').setDescription('Déverrouille un salon'),
  new SlashCommandBuilder().setName('purge').setDescription('Supprime des messages d\'un utilisateur')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true))
    .addIntegerOption(o => o.setName('nombre').setDescription('Nombre (1-100)').setRequired(false)),
  // Rôles réactifs
  new SlashCommandBuilder().setName('reactionrole').setDescription('Crée un message de rôles réactifs')
    .addStringOption(o => o.setName('titre').setDescription('Titre du message').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Description').setRequired(true)),
  // Logs
  new SlashCommandBuilder().setName('setlogs').setDescription('Définit le salon de logs de modération')
    .addChannelOption(o => o.setName('salon').setDescription('Salon de logs').setRequired(true)),
  // Auto-mod
  new SlashCommandBuilder().setName('automod').setDescription('Configure l\'auto-modération')
    .addStringOption(o => o.setName('action').setDescription('enable/disable').setRequired(true)
      .addChoices({ name: 'Activer', value: 'enable' }, { name: 'Désactiver', value: 'disable' })),
  // Utilitaires
  new SlashCommandBuilder().setName('role').setDescription('Donne ou retire un rôle')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true))
    .addRoleOption(o => o.setName('role').setDescription('Rôle').setRequired(true))
    .addStringOption(o => o.setName('action').setDescription('add/remove').setRequired(true)
      .addChoices({ name: 'Ajouter', value: 'add' }, { name: 'Retirer', value: 'remove' })),
  new SlashCommandBuilder().setName('nickname').setDescription('Change le pseudo d\'un membre')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true))
    .addStringOption(o => o.setName('pseudo').setDescription('Nouveau pseudo').setRequired(true)),
  new SlashCommandBuilder().setName('modlogs').setDescription('Voir les logs de modération d\'un membre')
    .addUserOption(o => o.setName('membre').setDescription('Membre').setRequired(true)),
].map(c => c.toJSON());

// ─── Fonction log de modération ───────────────────────────────────────────────
async function sendModLog(guild, action, target, moderator, reason, color = 0xFF6B35) {
  const logChannelId = modLogs.get(guild.id);
  if (!logChannelId) return;
  const logChannel = guild.channels.cache.get(logChannelId);
  if (!logChannel) return;

  const embed = new EmbedBuilder()
    .setTitle(`🔨 Action de modération : ${action}`)
    .addFields(
      { name: '👤 Cible', value: `${target.tag || target.user?.tag || 'Inconnu'} (${target.id || target.user?.id})`, inline: true },
      { name: '🛡️ Modérateur', value: `${moderator.tag} (${moderator.id})`, inline: true },
      { name: '📝 Raison', value: reason },
    )
    .setColor(color)
    .setTimestamp();
  await logChannel.send({ embeds: [embed] }).catch(() => {});
}

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`[CarlBot] ✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Modération BeluGANG 🛡️', { type: 3 });

  if (CLIENT_ID) {
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('[CarlBot] ✅ Slash commands enregistrées');
    } catch (e) {
      console.error('[CarlBot] Erreur slash commands:', e.message);
    }
  }
});

// ─── Auto-mod ─────────────────────────────────────────────────────────────────
client.on('messageCreate', async message => {
  if (message.author.bot || !message.guild) return;
  const config = automodConfig.get(message.guild.id);
  if (!config || !config.enabled) return;

  const badWords = ['spam', 'discord.gg/', 'http://bit.ly'];
  const content = message.content.toLowerCase();
  if (badWords.some(w => content.includes(w))) {
    try {
      await message.delete();
      await message.channel.send(`⚠️ <@${message.author.id}> Message supprimé par l'auto-modération.`);
      await sendModLog(message.guild, 'Auto-mod suppression', message.member, client.user, 'Contenu interdit détecté', 0xFFA500);
    } catch (e) {
      console.error('[CarlBot] Erreur auto-mod:', e.message);
    }
  }
});

// ─── Rôles réactifs ───────────────────────────────────────────────────────────
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch (e) { return; }
  }
  const roles = reactionRoles.get(reaction.message.id);
  if (!roles) return;
  const roleId = roles[reaction.emoji.name];
  if (!roleId) return;
  const guild = reaction.message.guild;
  const member = guild.members.cache.get(user.id);
  if (member) {
    await member.roles.add(roleId).catch(e => console.error('[CarlBot] Erreur ajout rôle:', e.message));
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) {
    try { await reaction.fetch(); } catch (e) { return; }
  }
  const roles = reactionRoles.get(reaction.message.id);
  if (!roles) return;
  const roleId = roles[reaction.emoji.name];
  if (!roleId) return;
  const guild = reaction.message.guild;
  const member = guild.members.cache.get(user.id);
  if (member) {
    await member.roles.remove(roleId).catch(e => console.error('[CarlBot] Erreur retrait rôle:', e.message));
  }
});

// ─── Interactions ─────────────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'warn') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ModerateMembers)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const membre = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison');
    if (!warns.has(membre.id)) warns.set(membre.id, []);
    warns.get(membre.id).push({ reason: raison, date: new Date(), modId: interaction.user.id });
    const count = warns.get(membre.id).length;

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Avertissement')
      .addFields(
        { name: '👤 Membre', value: `${membre.user.tag}`, inline: true },
        { name: '📊 Total warns', value: `${count}`, inline: true },
        { name: '📝 Raison', value: raison },
      )
      .setColor(0xFFA500)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
    await sendModLog(interaction.guild, 'Warn', membre, interaction.user, raison, 0xFFA500);

    // Auto-actions selon nombre de warns
    if (count >= 5) {
      await membre.ban({ reason: `5 warns accumulés` }).catch(() => {});
      await interaction.followUp({ content: `🔨 **${membre.user.tag}** banni automatiquement (5 warns).` });
    } else if (count >= 3) {
      await membre.timeout(10 * 60 * 1000, `3 warns accumulés`).catch(() => {});
      await interaction.followUp({ content: `🔇 **${membre.user.tag}** mute automatiquement (3 warns).` });
    }
  }

  else if (commandName === 'warns') {
    const membre = interaction.options.getMember('membre');
    const memberWarns = warns.get(membre.id) || [];
    const embed = new EmbedBuilder()
      .setTitle(`⚠️ Warns de ${membre.user.tag}`)
      .setColor(0xFFA500)
      .setDescription(memberWarns.length > 0
        ? memberWarns.map((w, i) => `**${i + 1}.** ${w.reason} — <@${w.modId}> — ${w.date.toLocaleDateString('fr-FR')}`).join('\n')
        : 'Aucun avertissement.')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'clearwarns') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Administrateur requis.', ephemeral: true });
    }
    const membre = interaction.options.getMember('membre');
    warns.delete(membre.id);
    await interaction.reply({ content: `✅ Warns de **${membre.user.tag}** effacés.` });
  }

  else if (commandName === 'slowmode') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const sec = interaction.options.getInteger('secondes');
    await interaction.channel.setRateLimitPerUser(sec);
    await interaction.reply({ content: sec === 0 ? '✅ Slowmode désactivé.' : `✅ Slowmode activé : **${sec}s**.` });
  }

  else if (commandName === 'lock') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: false });
    await interaction.reply({ content: '🔒 Salon verrouillé.' });
  }

  else if (commandName === 'unlock') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, { SendMessages: null });
    await interaction.reply({ content: '🔓 Salon déverrouillé.' });
  }

  else if (commandName === 'purge') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const membre = interaction.options.getMember('membre');
    const nb = interaction.options.getInteger('nombre') || 10;
    const messages = await interaction.channel.messages.fetch({ limit: 100 });
    const toDelete = messages.filter(m => m.author.id === membre.id).first(nb);
    await interaction.channel.bulkDelete(toDelete, true);
    await interaction.reply({ content: `✅ **${toDelete.length}** messages de ${membre.user.tag} supprimés.`, ephemeral: true });
  }

  else if (commandName === 'reactionrole') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const titre = interaction.options.getString('titre');
    const desc = interaction.options.getString('description');
    const embed = new EmbedBuilder()
      .setTitle(`🎭 ${titre}`)
      .setDescription(desc + '\n\nRéagis avec les emojis ci-dessous pour obtenir un rôle !')
      .setColor(0x5865F2)
      .setFooter({ text: 'Rôles réactifs — BeluGANG Events' })
      .setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    reactionRoles.set(msg.id, {});
    await interaction.followUp({ content: `✅ Message de rôles réactifs créé (ID: ${msg.id}). Utilise les réactions pour configurer les rôles.`, ephemeral: true });
  }

  else if (commandName === 'setlogs') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Administrateur requis.', ephemeral: true });
    }
    const salon = interaction.options.getChannel('salon');
    modLogs.set(interaction.guild.id, salon.id);
    await interaction.reply({ content: `✅ Salon de logs défini : ${salon}` });
  }

  else if (commandName === 'automod') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Administrateur requis.', ephemeral: true });
    }
    const action = interaction.options.getString('action');
    automodConfig.set(interaction.guild.id, { enabled: action === 'enable' });
    await interaction.reply({ content: `✅ Auto-modération **${action === 'enable' ? 'activée' : 'désactivée'}**.` });
  }

  else if (commandName === 'role') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const membre = interaction.options.getMember('membre');
    const role = interaction.options.getRole('role');
    const action = interaction.options.getString('action');
    try {
      if (action === 'add') {
        await membre.roles.add(role);
        await interaction.reply({ content: `✅ Rôle **${role.name}** ajouté à ${membre.user.tag}.` });
      } else {
        await membre.roles.remove(role);
        await interaction.reply({ content: `✅ Rôle **${role.name}** retiré de ${membre.user.tag}.` });
      }
    } catch (e) {
      await interaction.reply({ content: `❌ Erreur : ${e.message}`, ephemeral: true });
    }
  }

  else if (commandName === 'nickname') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageNicknames)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const membre = interaction.options.getMember('membre');
    const pseudo = interaction.options.getString('pseudo');
    try {
      await membre.setNickname(pseudo);
      await interaction.reply({ content: `✅ Pseudo de **${membre.user.tag}** changé en **${pseudo}**.` });
    } catch (e) {
      await interaction.reply({ content: `❌ Erreur : ${e.message}`, ephemeral: true });
    }
  }

  else if (commandName === 'modlogs') {
    const membre = interaction.options.getMember('membre');
    const memberWarns = warns.get(membre.id) || [];
    const embed = new EmbedBuilder()
      .setTitle(`📋 Logs de modération — ${membre.user.tag}`)
      .setColor(0xFF6B35)
      .setDescription(memberWarns.length > 0
        ? memberWarns.map((w, i) => `**Warn ${i + 1}** — ${w.reason} — ${w.date.toLocaleDateString('fr-FR')}`).join('\n')
        : 'Aucune action de modération.')
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }
});

// ─── Bienvenue ────────────────────────────────────────────────────────────────
client.on('guildMemberAdd', async member => {
  const welcomeChannel = member.guild.channels.cache.find(c => c.name === 'bienvenue' || c.name === 'welcome' || c.name === 'général');
  if (!welcomeChannel) return;
  const embed = new EmbedBuilder()
    .setTitle(`👋 Bienvenue sur ${member.guild.name} !`)
    .setDescription(`Bienvenue <@${member.id}> ! Tu es le **${member.guild.memberCount}ème** membre.`)
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setColor(0x57F287)
    .setTimestamp();
  await welcomeChannel.send({ embeds: [embed] }).catch(() => {});
});

client.on('error', err => console.error('[CarlBot] Erreur:', err));
process.on('unhandledRejection', err => console.error('[CarlBot] Unhandled:', err));

client.login(TOKEN);
