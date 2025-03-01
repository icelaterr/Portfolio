import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* Discord Durum İkonları – Orijinal Discord stiline yakın SVG’ler */
const OnlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#43B581" />
  </svg>
);

const IdleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 8 8 6 6 0 1 1-8-8z" fill="#FAA61A" />
  </svg>
);

const DndIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#F04747" />
    <rect x="4" y="7" width="8" height="2" fill="#747F8D" />
  </svg>
);

const OfflineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="7" fill="#36393F" stroke="#B9BBBE" strokeWidth="2" />
    <line x1="4" y1="4" x2="12" y2="12" stroke="#fff" strokeWidth="2" />
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

/* Rozet mapping – rozet dosyaları public/badges/[isim].png şeklinde yer alıyor. */
const badgeMapping = [
  { bit: 1, img: "/badges/brilliance.png" },
  { bit: 2, img: "/badges/aktif_gelistirici.png" },
  { bit: 4, img: "/badges/eski_isim.png" },
  { bit: 8, img: "/badges/gorev_tamamlandi.png" }
];

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

/* Süreyi okunabilir formata çevirir (örn. 1:23) */
const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Her saniye currentTime güncelleniyor (canlı ilerleme için)
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 5 saniyede bir veri yenilemesi; ilk yüklemede spinner, sonrasında sessiz güncelleme.
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

  // Custom status için: yalnızca id "custom" olan aktivite kullanılıyor.
  const customActivity = activities.find(act => act.id === "custom" && act.state && act.state.trim() !== "");
  const customState = customActivity ? customActivity.state : null;

  // Aktivite kartı: Custom status dışındaki aktivitelerden, timestamps olanları kullanıyoruz.
  let activityCard = null;
  const nonCustomActivities = activities.filter(act => act.id !== "custom" && act.timestamps && act.timestamps.start);
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
          <p className="text-xs text-gray-400 mt-1">
            {formatDurationMs(elapsedActivity)}
          </p>
        </div>
      </div>
    );
  }

  // Spotify kartı: Şarkı başlangıç ve bitiş zamanlarına göre ilerleme hesaplanıyor.
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
            <img
              src="/badges/spotify.png"
              alt="Spotify"
              className="w-6 h-6"
            />
          </div>
        </div>
        <div className="mt-3">
          <div className="w-full h-2 bg-gray-600 rounded-full">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-1">
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
      {/* Banner */}
      {discord_user.bannerURL && discord_user.bannerURL !== "" && (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${discord_user.bannerURL})` }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center">
          {/* Avatar ve Custom Status */}
          <div className="relative flex-shrink-0">
            <img
              src={avatarUrl}
              alt={discord_user.username}
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover"
            />
            {/* Custom status balonu; balon, avatarın soluna daha yakın konumlandırıldı */}
            {customState && (
              <div className="absolute -top-12 left-0 flex flex-col items-center">
                <div className="relative bg-gray-700 text-white text-xs px-3 py-1.5 shadow-lg rounded-lg">
                  {customState}
                </div>
                <div className="mt-1 flex flex-col items-center space-y-1">
                  <div className="w-2 h-2 bg-gray-700 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            )}
            {/* Durum ikonu: Avatarın sağ alt köşesinde */}
            <div className="absolute bottom-0 right-0 bg-gray-900 rounded-full p-1">
              {getStatusIcon(discord_status)}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <p className="text-sm text-gray-300">{discord_user.username}</p>
            {/* Rozetler: Tüm rozetler tek birleşik arka plan container’ında, container içeriğe göre otomatik boyutlanıyor */}
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
