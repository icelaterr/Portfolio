// server/server.js
import express from 'express';
import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';

// .env dosyasındaki değişkenleri yükle
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Discord bot istemcisini oluşturuyoruz; presence verilerini almak için gerekli intent'leri ekliyoruz.
const discordClient = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildPresences
  ]
});

discordClient.once('ready', () => {
  console.log(`Discord bot logged in as ${discordClient.user.tag}`);
});

// /api/discord-profile endpoint’i: Botun profil ve durum verilerini döndürür.
app.get('/api/discord-profile', (req, res) => {
  if (!discordClient.user) {
    return res.status(500).json({ error: 'Bot user not ready' });
  }
  
  const user = discordClient.user;
  const presence = user.presence;

  // Bot avatar URL'sini oluşturuyoruz; ayarlı değilse default avatar veriyoruz.
  const avatarUrl = user.avatarURL({ format: 'png', size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

  res.json({
    id: user.id,
    username: user.username,
    discriminator: user.discriminator,
    avatar: avatarUrl,
    banner: user.banner,           // Banner ayarlı değilse null dönebilir
    accent_color: user.accentColor, // Ayarlı değilse undefined dönebilir
    status: presence ? presence.status : 'offline',
    activities: presence 
      ? presence.activities.map(activity => ({
          name: activity.name,
          type: activity.type,
          state: activity.state,
          details: activity.details,
        }))
      : []
  });
});

// Bot giriş yaptıktan sonra Express sunucusunu başlatıyoruz.
discordClient.login(process.env.BOT_TOKEN)
  .then(() => {
    app.listen(port, () => {
      console.log(`Express server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Error logging in to Discord:', err);
  });
    
