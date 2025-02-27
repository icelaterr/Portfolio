// src/api/discord.ts
import axios from 'axios';
import { DiscordUser } from '../types/discord';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_USER_ID = '991409937022468169';

export const fetchDiscordUser = async (): Promise<DiscordUser | null> => {
  try {
    const token = import.meta.env.VITE_BOT_TOKEN;
    console.log("VITE_BOT_TOKEN:", token);
    if (!token) {
      throw new Error("BOT token is not defined");
    }
    const response = await axios.get(`${DISCORD_API_URL}/users/${DISCORD_USER_ID}`, {
      headers: {
        Authorization: `Bot ${token}`,
      },
    });
    const userData = response.data;
    
    // Simüle edilmiş durum verisi: örneğin "Playing Minecraft"
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
  } catch (error: any) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
};
