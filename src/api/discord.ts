import axios from 'axios';
import { DiscordUser } from '../types';

// Note: In a real-world scenario, you would need a backend service to handle Discord API requests
// as the Discord API doesn't support direct browser requests due to CORS restrictions

const DISCORD_API_URL = 'https://api.discord.com/api/v10';
const DISCORD_USER_ID = '991409937022468169';

// In a real implementation, this would be handled by a backend service
export const fetchDiscordUser = async (): Promise<DiscordUser | null> => {
  try {
    // In a production environment, this would be a call to your backend service
    // which would then use the BOT_TOKEN to fetch the Discord user data
    
    // For demonstration purposes, we're using a mock implementation
    // In a real implementation, you would use process.env.BOT_TOKEN
    
    // This is a simplified example of what the backend would do:
    // const response = await axios.get(`${DISCORD_API_URL}/users/${DISCORD_USER_ID}`, {
    //   headers: {
    //     Authorization: `Bot ${process.env.BOT_TOKEN}`
    //   }
    // });
    
    // For now, we'll return static data that matches your actual Discord status
    return {
      id: DISCORD_USER_ID,
      username: "IceLater",
      avatar: "https://cdn.discordapp.com/avatars/991409937022468169/a_d779a17318a18f14884f848e27b07a5e.gif",
      discriminator: "0",
      status: "idle", // Your actual status
      activities: [
        {
          name: "Spotify",
          type: 2, // 2 is the type for "Listening to"
          state: "Your favorite song",
          details: "Spotify"
        }
      ],
      banner: "https://cdn.discordapp.com/banners/991409937022468169/a_1234567890abcdef.png",
      accent_color: 5793266
    };
  } catch (error) {
    console.error('Error fetching Discord user:', error);
    return null;
  }
};