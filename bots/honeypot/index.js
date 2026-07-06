// ============================================================
// Bot Honeypot — BeluGANG Events
// COMPORTEMENT : Honeypot Pur
// • Crée le salon #honeypot (interdit d'écriture)
// • BAN IMMÉDIAT de quiconque écrit dedans
// • Plus d'injection de code (pour éviter le spam)
// ============================================================
const { Client, GatewayIntentBits, Partials, EmbedBuilder, SlashCommandBuilder, REST, Routes, ChannelType, PermissionsBitField, Events } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
  ],
  partials: [Partials.Message, Partials.Channel],
});

const TOKEN = process.env.HONEYPOT_TOKEN || process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.HONEYPOT_CLIENT_ID || process.env.CLIENT_ID || '';

const commands = [
  new SlashCommandBuilder().setName('honeypot-info').setDescription('Affiche les infos sur le système Honeypot'),
].map(c => c.toJSON());

async function setupHoneypotChannel(guild) {
  let channel = guild.channels.cache.find(ch => ch.name === 'honeypot' && ch.isTextBased());
  
  if (!channel) {
    try {
      console.log(`[Honeypot] 🔨 Création du salon piège dans ${guild.name}...`);
      channel = await guild.channels.create({
        name: 'honeypot',
        type: ChannelType.GuildText,
        topic: '🍯 ZONE PIÉGÉE — NE PAS ÉCRIRE ICI SOUS PEINE DE BAN DÉFINITIF',
        permissionOverwrites: [
          { 
            id: guild.roles.everyone.id, 
            allow: [PermissionsBitField.Flags.ViewChannel],
            deny: [PermissionsBitField.Flags.SendMessages] 
          },
          { 
            id: client.user.id, 
            allow: [PermissionsBitField.Flags.ManageMessages, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.BanMembers] 
          },
        ],
      });
      
      const embed = new EmbedBuilder()
        .setTitle('🍯 SYSTÈME HONEYPOT ACTIVÉ')
        .setDescription('⚠️ **ATTENTION** : Ce salon est un piège anti-raid et anti-spam.\n\n❌ **INTERDICTION FORMELLE D\'ÉCRIRE ICI.**\nTout message posté entraînera un **BAN IMMÉDIAT ET DÉFINITIF** du serveur.')
        .setColor(0xED4245)
        .setTimestamp();
        
      const msg = await channel.send({ embeds: [embed] });
      await msg.pin().catch(() => {});
      console.log(`[Honeypot] ✅ Salon #honeypot prêt dans ${guild.name}`);
    } catch (e) {
      console.error(`[Honeypot] ❌ Erreur setup salon dans ${guild.name}: ${e.message}`);
    }
  }
}

client.once(Events.ClientReady, async () => {
  console.log(`[Honeypot] ✅ Connecté en tant que ${client.user.tag}`);
  client.user.setActivity('Surveille #honeypot 🍯', { type: 3 });

  if (CLIENT_ID) {
    const rest = new REST({ version: '10' }).setToken(TOKEN);
    await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands }).catch(() => {});
  }
  
  for (const guild of client.guilds.cache.values()) {
    await setupHoneypotChannel(guild);
  }
});

client.on(Events.GuildCreate, async (guild) => {
  await setupHoneypotChannel(guild);
});

// ⚡ LE PIÈGE : Ban immédiat au premier message
client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;
  
  if (message.channel.name === 'honeypot') {
    const member = message.member;
    const authorTag = message.author.tag;
    
    // L'owner du serveur est immunisé (sécurité)
    if (message.author.id === message.guild.ownerId) {
      return message.reply("👑 Tu es l'owner, donc je ne te ban pas, mais fais attention à ne pas polluer le piège !").then(m => setTimeout(() => m.delete(), 5000));
    }

    try {
      console.log(`[Honeypot] ⚡ PIÈGE DÉCLENCHÉ : ${authorTag} a écrit dans #honeypot. Tentative de ban...`);
      
      // 1. Supprimer le message
      await message.delete().catch(() => {});
      
      // 2. Bannir le membre
      await message.guild.members.ban(message.author.id, { 
        reason: '🍯 Honeypot : A écrit dans le salon interdit #honeypot',
        deleteMessageSeconds: 3600 
      });
      
      console.log(`[Honeypot] 🔨 BAN RÉUSSI : ${authorTag} a été banni.`);
      
      // 3. Log l'action dans le salon (optionnel, pour que tu vois qui a été ban)
      const logEmbed = new EmbedBuilder()
        .setTitle('🔨 Ban Automatique — Honeypot')
        .setDescription(`Le membre **${authorTag}** a été banni pour avoir écrit dans ce salon.`)
        .setColor(0x000000)
        .setTimestamp();
      
      await message.channel.send({ embeds: [logEmbed] }).then(m => setTimeout(() => m.delete(), 10000));

    } catch (e) {
      console.error(`[Honeypot] ❌ Erreur lors du ban de ${authorTag}: ${e.message}`);
      // Si on ne peut pas ban, on essaie au moins de kick ou mute
      try {
        await member.kick('Honeypot : Message dans salon interdit').catch(() => {});
      } catch {}
    }
  }
});

client.login(TOKEN);
