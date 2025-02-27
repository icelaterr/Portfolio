import axios from 'axios';
import { DiscordUser } from '../types';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_USER_ID = '991409937022468169';

// Your backend must expose an endpoint that provides realtime presence data.
// For example: GET /discord/presence/:userId
// The BACKEND_URL should be set in your environment variables.
const PRESENCE_API_URL = `${process.env.BACKEND_URL || 'http://localhost:3000'}/discord/presence/${DISCORD_USER_ID}`;

export const fetchDiscordUser = async (): Promise<DiscordUser | null> => {
  try {
    // Fetch basic user info from Discord REST API using your BOT_TOKEN.
    const { data: userData } = await axios.get(`${DISCORD_API_URL}/users/${DISCORD_USER_ID}`, {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`
      }
    });

    // Fetch realtime presence data from your backend.
    const { data: presenceData } = await axios.get(PRESENCE_API_URL);

    return {
      ...userData,
      status: presenceData.status, // e.g., "online", "idle", "dnd", "offline"
      activities: presenceData.activities // e.g., dynamic list of activities such as Listening to Spotify
    };
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
};
