// src/api/discord.ts

import axios from 'axios';
import { DiscordUser } from '../types/discord';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_USER_ID = '991409937022468169';

export const fetchDiscordUser = async (): Promise<DiscordUser | null> => {
  try {
    // Bot token kullanarak kullanıcının temel verilerini çekiyoruz
    const response = await axios.get(`${DISCORD_API_URL}/users/${DISCORD_USER_ID}`, {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
      },
    });
    const userData = response.data;
    
    // RPC verisi çekilemediğinden, örnek durum (presence) verisi simüle ediyoruz.
    // Örneğin, kullanıcının şu anda Minecraft oynadığını varsayalım:
    const simulatedPresence = {
      status: 'online', // online, idle, dnd, offline
      activities: [
        {
          type: 0, // 0 → Playing
          name: 'Minecraft',
          details: 'Playing Minecraft',
          state: '',
        }
      ]
    };

    return {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
      discriminator: userData.discriminator,
      banner: userData.banner,
      accent_color: userData.accent_color,
      status: simulatedPresence.status,
      activities: simulatedPresence.activities,
    };
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
};
