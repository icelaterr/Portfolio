import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* --- Durum İkonları (Güncellenmiş Discord stili) --- */
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
    <rect x="3" y="7" width="10" height="2" fill="#2F3136" rx="1" />
  </svg>
);

const OfflineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="#747F8D" strokeWidth="2.5" />
  </svg>
);

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <OnlineIcon />;
    case 'idle':
      return <IdleIcon />;
    case 'dnd':
      return <DndIcon />;
    default:
      return <OfflineIcon />;
  }
};

/* --- Rozet Mapping --- */
const badgeMapping = [
  { bit: 1, img: "/badges/brilliance.png" },
  { bit: 2, img: "/badges/aktif_gelistirici.png" },
  { bit: 4, img: "/badges/eski_isim.png" },
  { bit: 8, img: "/badges/gorev_tamamlandi.png" }
];

/* --- Tip Tanımları --- */
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

type APIResponse = {
  data: LanyardData;
  success: boolean;
};

/* --- Süre Formatlama --- */
const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/* --- DiscordCard Component --- */
const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

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
        const username = data?.discord_user?.username || 'undefined';
        setError(`Veriler alınamadı: ${err.message}. Kullanıcı: ${username}`);
        console.error(err);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, [initialLoading]);

  if (initialLoading) {
    return (
      <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 animate-pulse text-white text-center">
        Yükleniyor...
      </div>
    );
  }

  if (error || !data) {
    const username = data?.discord_user?.username || 'undefined';
    return (
      <div className="max-w-md mx-auto bg-red-900/20 text-red-200 rounded-2xl shadow-2xl p-6 text-center">
        <p>{error || 'Profil yüklenemedi.'}</p>
        <p>Kullanıcı: {username}</p>
      </div>
    );
  }

  const { discord_user, activities, discord_status, listening_to_spotify, spotify } = data;
  const displayName = discord_user.display_name || discord_user.global_name || discord_user.username;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=1024`;
  const customActivity = activities.find(act => act.id === "custom" && act.state && act.state.trim() !== "");
  const customState = customActivity ? customActivity.state : null;

  // Aktivite kartı
  let activityCard = null;
  const nonCustomActivities = activities.filter(
    act => act.id !== "custom" && act.timestamps && act.timestamps.start
  );
  if (!listening_to_spotify && nonCustomActivities.length > 0) {
    const activity = nonCustomActivities[0];
    const elapsedActivity = currentTime - activity.timestamps!.start;
    activityCard = (
      <div className="mt-4 bg-gray-700/50 rounded-2xl p-4 flex items-center">
        {activity.assets?.large_image && (
          <img
            src={`https://cdn.discordapp.com/${activity.assets.large_image}`}
            alt={activity.name}
            className="w-16 h-16 rounded-md object-cover mr-4"
          />
        )}
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{activity.name}</h3>
          <p className="text-xs text-green-500 font-medium mt-1">
            {formatDurationMs(elapsedActivity)}
          </p>
        </div>
      </div>
    );
  }

  // Spotify kartı
  let spotifyCard = null;
  if (listening_to_spotify && spotify) {
    const { start, end } = spotify.timestamps;
    const totalDuration = end - start;
    const elapsed = Math.min(Math.max(currentTime - start, 0), totalDuration);
    const progressPercent = (elapsed / totalDuration) * 100;
    spotifyCard = (
      <div className="mt-4 bg-gray-700/50 rounded-2xl p-4">
        <div className="flex items-center">
          <img
            src={spotify.album_art_url}
            alt={spotify.album}
            className="w-16 h-16 rounded-md object-cover mr-4"
          />
          <div className="flex-1">
            <h3 className="text-sm font-bold text-white">{spotify.song}</h3>
            <p className="text-xs text-gray-300">
              {spotify.artist} &middot; {spotify.album}
            </p>
          </div>
          <div className="ml-2">
            <img src="/badges/spotify.png" alt="Spotify" className="w-6 h-6" />
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-600 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-green-500 font-medium mt-1">
            <span>{formatDurationMs(elapsed)}</span>
            <span>{formatDurationMs(totalDuration)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl relative"
    >
      {discord_user.bannerURL && (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${discord_user.bannerURL})` }}
        />
      )}
      <div className="p-6 relative">
        <div className="flex items-center">
          <div className="relative w-20 h-20">
            <img
              src={avatarUrl}
              alt={discord_user.username}
              className="w-full h-full rounded-full border-4 border-gray-800 object-cover"
            />
            <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1">
              {getStatusIcon(discord_status)}
            </div>
            {customState && (
              <div className="absolute -top-[72px] right-0 flex items-center gap-1.5">
                <div className="relative">
                  <div className="absolute -left-3.5 top-2.5 w-4 h-4 border-l-2 border-t-2 border-gray-600 rounded-tl-full transform rotate-45" />
                  <div className="bg-gray-700 text-white px-3 py-1.5 rounded-lg text-sm max-w-[200px] break-words shadow-lg whitespace-normal">
                    {customState}
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <p className="text-sm text-gray-300">{discord_user.username}</p>
            <div className="mt-1 bg-gray-900 inline-flex items-center px-2 py-1 rounded-lg">
              {badgeMapping.map(mapping => (
                <img key={mapping.bit} src={mapping.img} alt="rozet" className="w-4 h-4 mr-1 last:mr-0" />
              ))}
            </div>
          </div>
        </div>
        {listening_to_spotify ? spotifyCard : activityCard}
      </div>
    </motion.div>
  );
};

export default DiscordCard;
