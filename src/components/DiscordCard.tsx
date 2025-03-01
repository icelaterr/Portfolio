import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    display_name?: string;
  };
  activities: Array<{
    id: string;
    name: string;
    type: number;
    timestamps?: {
      start: number;
      end?: number;
    };
    assets?: {
      large_image?: string;
    };
  }>;
  discord_status: string;
  listening_to_spotify: boolean;
  spotify: {
    timestamps: {
      start: number;
      end: number;
    };
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
  } | null;
};

const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // **⏳ Her saniye güncellenen zaman**
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error("Veri alınamadı:", err);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (!data) return <div className="text-white">Yükleniyor...</div>;

  const { discord_user, activities, discord_status, listening_to_spotify, spotify } = data;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=1024`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // **🎵 Spotify İlerleme Çubuğu**
  let spotifyProgressBar = null;
  if (listening_to_spotify && spotify) {
    const { start, end } = spotify.timestamps;
    const totalDuration = end - start;
    const elapsed = Math.min(Math.max(currentTime - start, 0), totalDuration);
    const progressPercent = (elapsed / totalDuration) * 100;

    spotifyProgressBar = (
      <div className="mt-4 bg-gray-700/50 rounded-md p-4">
        <div className="flex items-center">
          <img src="https://cdn-icons-png.flaticon.com/512/174/174872.png" alt="Spotify" className="w-6 h-6 mr-2" />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{spotify.song}</h3>
            <p className="text-xs text-gray-300">{spotify.artist} &middot; {spotify.album}</p>
          </div>
        </div>
        {/* **Canlı Spotify İlerleme Çubuğu** */}
        <div className="mt-2 relative w-full h-2 bg-gray-600 rounded">
          <div
            className="h-2 bg-green-500 rounded transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{formatDurationMs(elapsed)}</span>
          <span>{formatDurationMs(totalDuration)}</span>
        </div>
      </div>
    );
  }

  // **🎮 Aktivite Kartı**
  let activityCard = null;
  if (!listening_to_spotify && activities.length > 0) {
    const activity = activities[0];
    const elapsedActivity = currentTime - (activity.timestamps?.start || currentTime);

    activityCard = (
      <div className="mt-4 bg-gray-700/50 rounded-md p-4 flex items-center">
        {activity.assets?.large_image && (
          <img src={`https://cdn.discordapp.com/${activity.assets.large_image}`} alt={activity.name} className="w-16 h-16 rounded-md object-cover mr-4" />
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{activity.name}</h3>
          <p className="text-xs text-gray-400 mt-1">Aktif: {formatDurationMs(elapsedActivity)}</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative">
            <img src={avatarUrl} alt={discord_user.username} className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover" />
            <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(discord_status)} rounded-full border-2 border-gray-800`} />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{discord_user.display_name || discord_user.username}</h2>
          </div>
        </div>
        {listening_to_spotify ? spotifyProgressBar : activityCard}
      </div>
    </motion.div>
  );
};

// **⏳ Yardımcı Fonksiyon: Süreyi Formatlar**
const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export default DiscordCard;
  
