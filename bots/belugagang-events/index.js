// ============================================================
// Bot BeluGANG Events — Gestion des événements du serveur
// NOUVEAUTÉS :
// • Events auto toutes les 5 minutes
// • Système de Belubecks (monnaie) — réservé au créateur du bot
// ============================================================
const { Client, GatewayIntentBits, Partials, EmbedBuilder, PermissionsBitField, SlashCommandBuilder, REST, Routes, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildScheduledEvents,
  ],
  partials: [Partials.Message, Partials.Channel],
});

const TOKEN = process.env.EVENTS_TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.EVENTS_CLIENT_ID || '';
const BOT_CREATOR_ID = process.env.BOT_CREATOR_ID || ''; // ID du créateur du bot

// ─── Stockage en mémoire ──────────────────────────────────────────────────────
const events = new Map();
const belubecks = new Map(); // userId -> montant

// ─── Catalogue d'events automatiques ──────────────────────────────────────────
const AUTO_EVENTS = [
  {
    nom: '🎮 Soirée Gaming BeluGANG',
    description: 'Rejoins-nous pour une soirée gaming entre membres ! Tous les jeux sont les bienvenus.',
    lieu: 'Vocal #gaming',
    emoji: '🎮',
    color: 0x5865F2,
  },
  {
    nom: '🎁 Giveaway Flash BeluGANG',
    description: 'Un giveaway surprise pour les membres actifs ! Réagis avec 🎉 pour participer.',
    lieu: 'Discord',
    emoji: '🎁',
    color: 0xFFD700,
  },
  {
    nom: '🏆 Tournoi BeluGANG',
    description: 'Tournoi mensuel BeluGANG — inscris-toi maintenant ! Les meilleurs joueurs seront récompensés.',
    lieu: 'Vocal #tournoi',
    emoji: '🏆',
    color: 0xFF6B35,
  },
  {
    nom: '🎬 Watch Party BeluGANG',
    description: 'On regarde ensemble un film ou une série ! Vote pour ton choix dans #vote.',
    lieu: 'Stage Discord',
    emoji: '🎬',
    color: 0xED4245,
  },
  {
    nom: '🎤 Karaoké BeluGANG',
    description: 'Soirée karaoké dans le vocal ! Viens chanter avec la communauté BeluGANG.',
    lieu: 'Vocal #musique',
    emoji: '🎤',
    color: 0x57F287,
  },
  {
    nom: '📸 Concours Screenshot BeluGANG',
    description: 'Poste ton meilleur screenshot de jeu dans #screenshots. Le meilleur gagne un rôle exclusif !',
    lieu: '#screenshots',
    emoji: '📸',
    color: 0xFEE75C,
  },
  {
    nom: '🤝 Recrutement BeluGANG',
    description: 'BeluGANG recrute ! Rejoins l\'équipe en postulant dans #recrutement.',
    lieu: '#recrutement',
    emoji: '🤝',
    color: 0x57F287,
  },
  {
    nom: '🎯 Quiz BeluGANG',
    description: 'Quiz culture générale + gaming ! Le premier à répondre correctement gagne des points.',
    lieu: '#quiz',
    emoji: '🎯',
    color: 0x5865F2,
  },
];

let autoEventIndex = 0;

// ─── Fonction d'envoi d'event automatique ─────────────────────────────────────
async function sendAutoEvent(guild) {
  const targetChannel = guild.channels.cache.find(ch =>
    ch.isTextBased() && (
      ch.name === 'events' ||
      ch.name === 'événements' ||
      ch.name === 'evenements' ||
      ch.name === 'annonces' ||
      ch.name === 'général' ||
      ch.name === 'general' ||
      ch.name === 'chat'
    )
  ) || guild.systemChannel;

  if (!targetChannel) {
    console.log(`[BeluGANG Events] ⚠️ Pas de salon cible dans ${guild.name}`);
    return;
  }

  const event = AUTO_EVENTS[autoEventIndex % AUTO_EVENTS.length];
  const id = Date.now().toString(36).toUpperCase();
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  events.set(id, {
    id,
    nom: event.nom,
    description: event.description,
    date: dateStr,
    lieu: event.lieu,
    createur: client.user.id,
    participants: new Set(),
    createdAt: now,
    auto: true,
  });

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`join_${id}`).setLabel('✋ Participer').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`info_${id}`).setLabel('ℹ️ Infos').setStyle(ButtonStyle.Secondary),
  );

  const embed = new EmbedBuilder()
    .setTitle(`${event.emoji} ${event.nom}`)
    .setDescription(event.description)
    .addFields(
      { name: '📅 Date', value: dateStr, inline: true },
      { name: '📍 Lieu', value: event.lieu, inline: true },
      { name: '🆔 ID', value: `\`${id}\``, inline: true },
    )
    .setColor(event.color)
    .setFooter({ text: `BeluGANG Events • Auto-event #${autoEventIndex + 1}` })
    .setTimestamp();

  try {
    await targetChannel.send({ embeds: [embed], components: [row] });
    console.log(`[BeluGANG Events] ✅ Auto-event "${event.nom}" envoyé dans #${targetChannel.name} (${guild.name})`);
  } catch (e) {
    console.error(`[BeluGANG Events] ❌ Erreur auto-event: ${e.message}`);
  }

  autoEventIndex++;
}

// ─── Slash Commands ──────────────────────────────────────────────────────────
const commands = [
  new SlashCommandBuilder().setName('event-create').setDescription('Crée un nouvel événement')
    .addStringOption(o => o.setName('nom').setDescription('Nom de l\'événement').setRequired(true))
    .addStringOption(o => o.setName('description').setDescription('Description').setRequired(true))
    .addStringOption(o => o.setName('date').setDescription('Date (DD/MM/YYYY HH:MM)').setRequired(true))
    .addStringOption(o => o.setName('lieu').setDescription('Lieu ou lien').setRequired(false)),
  new SlashCommandBuilder().setName('event-list').setDescription('Liste tous les événements à venir'),
  new SlashCommandBuilder().setName('event-delete').setDescription('Supprime un événement')
    .addStringOption(o => o.setName('id').setDescription('ID de l\'événement').setRequired(true)),
  new SlashCommandBuilder().setName('event-info').setDescription('Infos sur un événement')
    .addStringOption(o => o.setName('id').setDescription('ID de l\'événement').setRequired(true)),
  new SlashCommandBuilder().setName('event-join').setDescription('Rejoindre un événement')
    .addStringOption(o => o.setName('id').setDescription('ID de l\'événement').setRequired(true)),
  new SlashCommandBuilder().setName('event-auto').setDescription('Force l\'envoi d\'un event automatique (Admin)'),
  
  // ── Belubecks (réservé au créateur) ──────────────────────────────────────
  new SlashCommandBuilder().setName('give-belubecks').setDescription('Donne des Belubecks à un utilisateur (Créateur uniquement)')
    .addUserOption(o => o.setName('utilisateur').setDescription('Utilisateur qui reçoit les Belubecks').setRequired(true))
    .addIntegerOption(o => o.setName('montant').setDescription('Montant de Belubecks').setRequired(true)),
  new SlashCommandBuilder().setName('belubecks-balance').setDescription('Affiche ton solde de Belubecks'),
  new SlashCommandBuilder().setName('belubecks-top').setDescription('Affiche le top 10 des Belubecks'),
  
  new SlashCommandBuilder().setName('giveaway').setDescription('Lance un giveaway')
    .addStringOption(o => o.setName('prix').setDescription('Prix du giveaway').setRequired(true))
    .addIntegerOption(o => o.setName('duree').setDescription('Durée en minutes').setRequired(true))
    .addIntegerOption(o => o.setName('gagnants').setDescription('Nombre de gagnants').setRequired(false)),
  new SlashCommandBuilder().setName('announce').setDescription('Fait une annonce officielle')
    .addStringOption(o => o.setName('message').setDescription('Message d\'annonce').setRequired(true))
    .addStringOption(o => o.setName('mention').setDescription('Mention (@everyone, @here, rôle)').setRequired(false)),
  new SlashCommandBuilder().setName('vote').setDescription('Lance un vote')
    .addStringOption(o => o.setName('question').setDescription('Question').setRequired(true))
    .addStringOption(o => o.setName('option1').setDescription('Option 1').setRequired(true))
    .addStringOption(o => o.setName('option2').setDescription('Option 2').setRequired(true))
    .addStringOption(o => o.setName('option3').setDescription('Option 3').setRequired(false)),
].map(c => c.toJSON());

// ─── Ready ────────────────────────────────────────────────────────────────────
client.once('ready', async () => {
  console.log(`[BeluGANG Events] ✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Events auto + Belubecks 💰', { type: 3 });

  if (CLIENT_ID) {
    try {
      const rest = new REST({ version: '10' }).setToken(TOKEN);
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
      console.log('[BeluGANG Events] ✅ Slash commands enregistrées');
    } catch (e) {
      console.error('[BeluGANG Events] Erreur slash commands:', e.message);
    }
  }

  console.log('[BeluGANG Events] ⏰ Auto-events activés (toutes les 5 minutes)');

  setTimeout(async () => {
    for (const guild of client.guilds.cache.values()) {
      await sendAutoEvent(guild);
    }
  }, 30 * 1000);

  setInterval(async () => {
    for (const guild of client.guilds.cache.values()) {
      await sendAutoEvent(guild);
    }
  }, 5 * 60 * 1000);
});

// ─── Interactions ─────────────────────────────────────────────────────────────
client.on('interactionCreate', async interaction => {
  // Boutons
  if (interaction.isButton()) {
    const [action, eventId] = interaction.customId.split('_');

    if (action === 'join') {
      const event = events.get(eventId);
      if (!event) return interaction.reply({ content: '❌ Événement introuvable.', ephemeral: true });
      if (!event.participants) event.participants = new Set();
      if (event.participants.has(interaction.user.id)) {
        return interaction.reply({ content: '✅ Tu es déjà inscrit à cet événement !', ephemeral: true });
      }
      event.participants.add(interaction.user.id);
      return interaction.reply({ content: `✅ Tu es inscrit à **${event.nom}** ! (${event.participants.size} participant(s))`, ephemeral: true });
    }

    if (action === 'info') {
      const event = events.get(eventId);
      if (!event) return interaction.reply({ content: '❌ Événement introuvable.', ephemeral: true });
      const embed = new EmbedBuilder()
        .setTitle(`📋 ${event.nom}`)
        .setDescription(event.description)
        .addFields(
          { name: '📅 Date', value: event.date, inline: true },
          { name: '📍 Lieu', value: event.lieu, inline: true },
          { name: '👥 Participants', value: `${event.participants ? event.participants.size : 0}`, inline: true },
        )
        .setColor(0xFF6B35)
        .setTimestamp();
      return interaction.reply({ embeds: [embed], ephemeral: true });
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  const { commandName } = interaction;

  if (commandName === 'event-create') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const id = Date.now().toString(36).toUpperCase();
    const event = {
      id,
      nom: interaction.options.getString('nom'),
      description: interaction.options.getString('description'),
      date: interaction.options.getString('date'),
      lieu: interaction.options.getString('lieu') || 'Non spécifié',
      createur: interaction.user.id,
      participants: new Set(),
      createdAt: new Date(),
    };
    events.set(id, event);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder().setCustomId(`join_${id}`).setLabel('✋ Participer').setStyle(ButtonStyle.Success),
      new ButtonBuilder().setCustomId(`info_${id}`).setLabel('ℹ️ Infos').setStyle(ButtonStyle.Secondary),
    );

    const embed = new EmbedBuilder()
      .setTitle(`🎉 Nouvel Événement : ${event.nom}`)
      .setDescription(event.description)
      .addFields(
        { name: '📅 Date', value: event.date, inline: true },
        { name: '📍 Lieu', value: event.lieu, inline: true },
        { name: '🆔 ID', value: id, inline: true },
        { name: '👤 Organisateur', value: `<@${event.createur}>`, inline: true },
      )
      .setColor(0xFF6B35)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  else if (commandName === 'event-list') {
    if (events.size === 0) {
      return interaction.reply({ content: '📭 Aucun événement prévu pour le moment.', ephemeral: true });
    }
    const embed = new EmbedBuilder()
      .setTitle('📅 Événements à venir — BeluGANG Events')
      .setColor(0xFF6B35)
      .setTimestamp();
    let count = 0;
    events.forEach((e, id) => {
      if (count < 25) {
        embed.addFields({ name: `${e.nom} [${id}]`, value: `📅 ${e.date} | 📍 ${e.lieu} | 👥 ${e.participants ? e.participants.size : 0} participants${e.auto ? ' *(auto)*' : ''}` });
        count++;
      }
    });
    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'event-delete') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageEvents)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const id = interaction.options.getString('id');
    if (!events.has(id)) return interaction.reply({ content: '❌ Événement introuvable.', ephemeral: true });
    events.delete(id);
    await interaction.reply({ content: `✅ Événement \`${id}\` supprimé.` });
  }

  else if (commandName === 'event-info') {
    const id = interaction.options.getString('id');
    const event = events.get(id);
    if (!event) return interaction.reply({ content: '❌ Événement introuvable.', ephemeral: true });
    const embed = new EmbedBuilder()
      .setTitle(`📋 ${event.nom}`)
      .setDescription(event.description)
      .addFields(
        { name: '📅 Date', value: event.date, inline: true },
        { name: '📍 Lieu', value: event.lieu, inline: true },
        { name: '👥 Participants', value: `${event.participants ? event.participants.size : 0}`, inline: true },
        { name: '👤 Organisateur', value: `<@${event.createur}>`, inline: true },
      )
      .setColor(0xFF6B35)
      .setTimestamp();
    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'event-join') {
    const id = interaction.options.getString('id');
    const event = events.get(id);
    if (!event) return interaction.reply({ content: '❌ Événement introuvable.', ephemeral: true });
    if (!event.participants) event.participants = new Set();
    if (event.participants.has(interaction.user.id)) {
      return interaction.reply({ content: '✅ Tu es déjà inscrit !', ephemeral: true });
    }
    event.participants.add(interaction.user.id);
    await interaction.reply({ content: `✅ Inscrit à **${event.nom}** ! (${event.participants.size} participants)`, ephemeral: true });
  }

  else if (commandName === 'event-auto') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    await interaction.reply({ content: '🔄 Envoi d\'un auto-event...', ephemeral: true });
    await sendAutoEvent(interaction.guild);
    await interaction.followUp({ content: '✅ Auto-event envoyé !', ephemeral: true });
  }

  // ── Belubecks ─────────────────────────────────────────────────────────────
  else if (commandName === 'give-belubecks') {
    // Vérifier que c'est le créateur du bot
    if (interaction.user.id !== BOT_CREATOR_ID && !interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '❌ Seul le créateur du bot peut utiliser cette commande.', ephemeral: true });
    }

    const user = interaction.options.getUser('utilisateur');
    const montant = interaction.options.getInteger('montant');

    if (montant <= 0) {
      return interaction.reply({ content: '❌ Le montant doit être positif.', ephemeral: true });
    }

    const currentBalance = belubecks.get(user.id) || 0;
    belubecks.set(user.id, currentBalance + montant);

    const embed = new EmbedBuilder()
      .setTitle('💰 Belubecks Distribués')
      .setDescription(`${interaction.user.tag} a donné **${montant} Belubecks** à ${user.tag}`)
      .addFields(
        { name: 'Nouveau solde', value: `${currentBalance + montant} 💰`, inline: true },
      )
      .setColor(0xFFD700)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'belubecks-balance') {
    const balance = belubecks.get(interaction.user.id) || 0;
    const embed = new EmbedBuilder()
      .setTitle(`💰 Ton solde de Belubecks`)
      .setDescription(`Tu as **${balance} Belubecks**`)
      .setColor(0xFFD700)
      .setThumbnail(interaction.user.displayAvatarURL())
      .setTimestamp();
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  else if (commandName === 'belubecks-top') {
    const sorted = [...belubecks.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    if (sorted.length === 0) {
      return interaction.reply({ content: '📭 Aucun Belubecks distribués pour le moment.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle('🏆 Top 10 Belubecks')
      .setColor(0xFFD700)
      .setDescription(sorted.map((entry, i) => {
        const userId = entry[0];
        const amount = entry[1];
        return `**${i + 1}.** <@${userId}> — **${amount} 💰**`;
      }).join('\n'))
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  else if (commandName === 'giveaway') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const prix = interaction.options.getString('prix');
    const duree = interaction.options.getInteger('duree');
    const gagnants = interaction.options.getInteger('gagnants') || 1;
    const finAt = new Date(Date.now() + duree * 60 * 1000);

    const embed = new EmbedBuilder()
      .setTitle('🎁 GIVEAWAY !')
      .setDescription(`**Prix :** ${prix}\n\nRéagis avec 🎉 pour participer !\n\n**Fin :** <t:${Math.floor(finAt.getTime() / 1000)}:R>\n**Gagnants :** ${gagnants}`)
      .setColor(0xFFD700)
      .setFooter({ text: `Organisé par ${interaction.user.tag}` })
      .setTimestamp(finAt);

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    await msg.react('🎉');

    setTimeout(async () => {
      try {
        const reaction = msg.reactions.cache.get('🎉');
        if (!reaction) return;
        const users = await reaction.users.fetch();
        const eligibles = users.filter(u => !u.bot).map(u => u);
        if (eligibles.length === 0) {
          return msg.reply('❌ Pas assez de participants pour ce giveaway.');
        }
        const winners = [];
        const pool = [...eligibles];
        for (let i = 0; i < Math.min(gagnants, pool.length); i++) {
          const idx = Math.floor(Math.random() * pool.length);
          winners.push(pool.splice(idx, 1)[0]);
        }
        const winEmbed = new EmbedBuilder()
          .setTitle('🎉 Giveaway Terminé !')
          .setDescription(`**Prix :** ${prix}\n\n🏆 **Gagnant(s) :** ${winners.map(w => `<@${w.id}>`).join(', ')}`)
          .setColor(0x57F287)
          .setTimestamp();
        await msg.reply({ embeds: [winEmbed] });
      } catch (e) {
        console.error('[BeluGANG Events] Erreur giveaway:', e.message);
      }
    }, duree * 60 * 1000);
  }

  else if (commandName === 'announce') {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return interaction.reply({ content: '❌ Permission insuffisante.', ephemeral: true });
    }
    const message = interaction.options.getString('message');
    const mention = interaction.options.getString('mention') || '';
    const embed = new EmbedBuilder()
      .setTitle('📢 Annonce Officielle')
      .setDescription(message)
      .setColor(0xFF6B35)
      .setFooter({ text: `Annonce par ${interaction.user.tag}` })
      .setTimestamp();
    await interaction.reply({ content: mention, embeds: [embed] });
  }

  else if (commandName === 'vote') {
    const question = interaction.options.getString('question');
    const opts = [
      interaction.options.getString('option1'),
      interaction.options.getString('option2'),
      interaction.options.getString('option3'),
    ].filter(Boolean);
    const emojis = ['1️⃣', '2️⃣', '3️⃣'];
    const embed = new EmbedBuilder()
      .setTitle(`🗳️ Vote : ${question}`)
      .setDescription(opts.map((o, i) => `${emojis[i]} ${o}`).join('\n'))
      .setColor(0x5865F2)
      .setFooter({ text: `Vote lancé par ${interaction.user.tag}` })
      .setTimestamp();
    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
    for (let i = 0; i < opts.length; i++) await msg.react(emojis[i]);
  }
});

client.on('error', err => console.error('[BeluGANG Events] Erreur:', err));
process.on('unhandledRejection', err => console.error('[BeluGANG Events] Unhandled:', err));

client.login(TOKEN);
