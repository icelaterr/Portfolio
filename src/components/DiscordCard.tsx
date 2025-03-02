import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* --- Güncellenmiş Durum İkonları --- */
const OnlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#43B581" />
  </svg>
);

const IdleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 16A8 8 0 1 0 8 0a6 6 0 0 1 0 12z" fill="#FAA61A" />
  </svg>
);

const DndIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#F04747" />
    <rect x="4" y="7" width="8" height="2" fill="#4F545C" />
  </svg>
);

const OfflineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="#5C646E" strokeWidth="2.5" />
  </svg>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online': return <OnlineIcon />;
    case 'idle': return <IdleIcon />;
    case 'dnd': return <DndIcon />;
    default: return <OfflineIcon />;
  }
};

/* --- Rozet Mapping --- */
const badgeMapping = [
  { bit: 1, img: "/badges/brilliance.png" },
  { bit: 2, img: "/badges/aktif_gelistirici.png" },
  { bit: 4, img: "/badges/eski_isim.png" },
  { bit: 8, img: "/badges/gorev_tamamlandi.png" }
];

/* --- Tip Tanımları ve Yardımcı Fonksiyonlar --- */
type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    display_name?: string;
    global_name?: string;
    public_flags?: number;
    bannerURL?: string;
  };
  activities: Array<{
    id: string;
    name: string;
    type: number;
    state?: string;
    timestamps?: { start: number; end?: number };
    assets?: { large_image?: string };
  }>;
  discord_status: string;
  listening_to_spotify: boolean;
  spotify: {
    timestamps: { start: number; end: number };
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
  } | null;
};

type APIResponse = { data: LanyardData; success: boolean };

const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0 
    ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/* --- Ana Component --- */
const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: APIResponse = await res.json();
        if (!json.success) throw new Error('API response unsuccessful');
        setData(json.data);
        setError(null);
        if (initialLoading) setInitialLoading(false);
      } catch (err: any) {
        setError(`Veriler alınamadı: ${err.message}`);
        console.error(err);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [initialLoading]);

  if (initialLoading) return (
    <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 animate-pulse text-white text-center">
      Yükleniyor...
    </div>
  );

  if (error || !data) return (
    <div className="max-w-md mx-auto bg-red-900/20 text-red-200 rounded-2xl shadow-2xl p-6 text-center">
      <p>{error || 'Profil yüklenemedi.'}</p>
    </div>
  );

  const { discord_user, activities, discord_status, listening_to_spotify, spotify } = data;
  const displayName = discord_user.display_name || discord_user.global_name || discord_user.username;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=1024`;
  const customActivity = activities.find(act => act.id === "custom" && act.state?.trim());

  /* --- Aktivite Kartları --- */
  const renderActivity = () => {
    if (listening_to_spotify && spotify) {
      const { start, end } = spotify.timestamps;
      const totalDuration = end - start;
      const elapsed = Math.min(Math.max(currentTime - start, 0), totalDuration);
      const progressPercent = (elapsed / totalDuration) * 100;

      return (
        <div className="mt-4 bg-gray-700/50 rounded-2xl p-4">
          <div className="flex items-center">
            <img src={spotify.album_art_url} alt={spotify.album} className="w-16 h-16 rounded-md object-cover mr-4" />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{spotify.song}</h3>
              <p className="text-xs text-gray-300">{spotify.artist} &middot; {spotify.album}</p>
            </div>
            <img src="/badges/spotify.png" alt="Spotify" className="w-6 h-6 ml-2" />
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-600 rounded-full">
              <div className="h-2 bg-green-500 rounded-full transition-all duration-1000 ease-linear" 
                   style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="flex justify-between text-xs text-green-500 font-medium mt-1">
              <span>{formatDurationMs(elapsed)}</span>
              <span>{formatDurationMs(totalDuration)}</span>
            </div>
          </div>
        </div>
      );
    }

    const activity = activities.find(act => act.id !== "custom" && act.timestamps?.start);
    if (!activity) return null;

    const elapsed = currentTime - activity.timestamps!.start;
    return (
      <div className="mt-4 bg-gray-700/50 rounded-2xl p-4 flex items-center">
        {activity.assets?.large_image && (
          <img src={`https://cdn.discordapp.com/${activity.assets.large_image}`} 
               alt={activity.name} 
               className="w-16 h-16 rounded-md object-cover mr-4" />
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{activity.name}</h3>
          <p className="text-xs text-green-500 font-medium mt-1">{formatDurationMs(elapsed)}</p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl relative"
    >
      {discord_user.bannerURL && (
        <div className="h-24 w-full bg-cover bg-center" 
             style={{ backgroundImage: `url(${discord_user.bannerURL})` }} />
      )}

      <div className="p-6 relative">
        <div className="flex items-center">
          <div className="relative w-20 h-20">
            <img src={avatarUrl} alt={discord_user.username} 
                 className="w-full h-full rounded-full border-4 border-gray-800 object-cover" />
            
            <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1">
              {getStatusIcon(discord_status)}
            </div>

            {customActivity?.state && (
              <div className="absolute -top-20 -right-8">
                <div className="relative">
                  <div className="bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg shadow-lg max-w-[160px] break-words">
                    {customActivity.state}
                    <div className="absolute top-full left-1/2 -translate-x-1/2">
                      <div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-gray-700" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <p className="text-sm text-gray-300">@{discord_user.username}</p>
            <div className="mt-1 bg-gray-900 inline-flex items-center px-2 py-1 rounded-lg">
              {badgeMapping.map(mapping => (
                <img key={mapping.bit} src={mapping.img} alt="rozet" className="w-4 h-4 mr-1 last:mr-0" />
              ))}
            </div>
          </div>
        </div>

        {renderActivity()}
      </div>
    </motion.div>
  );
};

export default DiscordCard;
