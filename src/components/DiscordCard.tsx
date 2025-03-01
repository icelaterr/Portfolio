import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, AlertCircle, CheckCircle, Slash } from 'lucide-react';

/* 
  Tip tanımlamaları; public_flags eklendi.
  "state" alanı activity içinde (örneğin Spotify'da veya custom status'ta) olabilir.
*/
type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    display_name?: string;
    global_name?: string;
    public_flags?: number;
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

// Yardımcı: milisaniyeyi okunabilir süreye çevirir (örn. 1:23)
const formatDurationMs = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Durum ikonlarını Discord'a benzer şekilde oluşturuyoruz.
// İkonlar avatarın içine, sol alt köşeye yerleştirilecek.
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'online':
      return <CheckCircle size={14} color="#43B581" />;
    case 'idle':
      return <Moon size={14} color="#FAA61A" />;
    case 'dnd':
      return <AlertCircle size={14} color="#F04747" />;
    default:
      return <Slash size={14} color="#747F8D" />;
  }
};

// Discord rozetleri için örnek badge mapping (örnek URL'ler, güncel URL'leri projeye göre güncelleyin)
const badgeMapping: { bit: number; img: string }[] = [
  // Örneğin: House Brilliance (bit 128)
  { bit: 128, img: "https://cdn.discordapp.com/emojis/885215424705256724.png" },
  // Örneğin: Bot Developer (bit 1<<22 = 4194304)
  { bit: 4194304, img: "https://cdn.discordapp.com/emojis/885215424705256725.png" }
];

const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // currentTime her saniye güncellensin; progress hesaplamaları için.
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Her saniye currentTime'i güncelle
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Veri yenileme aralığı 5 saniye (5000 ms)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json: APIResponse = await res.json();
        if (!json.success) throw new Error('API response unsuccessful');
        setData(json.data);
        setError(null);
      } catch (err: any) {
        const username = data?.discord_user?.username || 'undefined';
        setError(`Veriler alınamadı: ${err.message}. Kullanıcı: ${username}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-800 rounded-2xl shadow-2xl p-6 animate-pulse text-white">
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

  // Eğer varsa, custom state (konuşma balonu metni) için ilk aktivitedeki state alanını alalım
  const customState = activities.find(act => act.state && act.state.trim() !== "")?.state;

  // Hesaplanan rozetler
  const badges: { img: string }[] = [];
  if (discord_user.public_flags) {
    badgeMapping.forEach(mapping => {
      if ((discord_user.public_flags! & mapping.bit) !== 0) {
        badges.push({ img: mapping.img });
      }
    });
  }

  // Spotify kartı: İlerleme hesaplaması
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
              src="https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg"
              alt="Spotify"
              className="w-8 h-8"
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

  // Aktivite kartı: Eğer Spotify aktif değilse ve aktiviteler varsa
  let activityCard = null;
  if (!listening_to_spotify && activities.length > 0) {
    const activity = activities[0];
    const elapsedActivity = currentTime - (activity.timestamps?.start || currentTime);
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
            Aktif: {formatDurationMs(elapsedActivity)}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden relative"
    >
      {/* Eğer custom state varsa; profilin üstünde konuşma balonu */}
      {customState && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2">
          <div className="relative bg-gray-700 text-white text-xs px-3 py-1 rounded-lg shadow-lg">
            {customState}
            <div className="absolute bottom-[-6px] left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-t-6 border-t-gray-700 border-x-6 border-x-transparent"></div>
            </div>
          </div>
        </div>
      )}
      {/* Banner (varsa) */}
      {discord_user.bannerURL && discord_user.bannerURL !== "" && (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${discord_user.bannerURL})` }}
        />
      )}
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={discord_user.username}
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover"
            />
            {/* Durum ikonu avatarın içine, alt sol köşede */}
            <div className="absolute bottom-1 left-1">
              {getStatusIcon(discord_status)}
            </div>
          </div>
          <div className="ml-4">
            <h2 className="text-2xl font-bold text-white">{displayName}</h2>
            <p className="text-sm text-gray-300">{discord_user.username}</p>
            {/* Rozetler: Eğer public_flags varsa, badgeMapping'ten uygun rozetleri gösteriyoruz */}
            {discord_user.public_flags && (
              <div className="flex space-x-1 mt-1">
                {badgeMapping.map(mapping =>
                  (discord_user.public_flags! & mapping.bit) !== 0 ? (
                    <img
                      key={mapping.bit}
                      src={mapping.img}
                      alt="rozet"
                      className="w-5 h-5"
                    />
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>
        {listening_to_spotify ? spotifyCard : activityCard}
      </div>
    </motion.div>
  );
};

export default DiscordCard;
