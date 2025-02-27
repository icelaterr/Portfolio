import axios from 'axios';
import { DiscordUser } from '../types';

const DISCORD_API_URL = 'https://discord.com/api/v10';
const DISCORD_USER_ID = '991409937022468169';

export const fetchDiscordUser = async (): Promise<DiscordUser | null> => {
  try {
    // Fetch basic user data using your bot token from process.env.BOT_TOKEN.
    const response = await axios.get(`${DISCORD_API_URL}/users/${DISCORD_USER_ID}`, {
      headers: {
        Authorization: `Bot ${process.env.BOT_TOKEN}`,
      },
    });
    const userData = response.data;
    
    // IMPORTANT: The /users endpoint does not include presence data.
    // If your bot and user share a guild, you could get presence by calling:
    //   GET /guilds/{guild.id}/members/{user.id}
    // For simplicity, assume you have (or simulate) presence data:
    const simulatedPresence = {
      status: 'idle', // Could be "online", "idle", "dnd", or "offline"
      activities: [
        // The activity here would update based on actual presence events.
        // For example, if the user is playing a game, the activity type would be 0 and
        // details, state, and name would reflect that.
        // If nothing is active, leave this array empty.
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
