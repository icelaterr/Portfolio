// src/components/DiscordCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Küçük Spotify logosu (inline SVG)
 */
const SpotifyLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} role="img" viewBox="0 0 168 168" xmlns="http://www.w3.org/2000/svg">
    <title>Spotify</title>
    <path fill="#1ED760" d="M84,0a84,84,0,1,0,84,84A84.095,84.095,0,0,0,84,0Zm38.208,121.791a6.295,6.295,0,0,1-8.651,1.722c-23.685-14.537-53.54-17.835-88.2-9.77a6.3,6.3,0,1,1-2.836-12.207c38.251-9.693,71.156-6.072,97.871,11.318A6.295,6.295,0,0,1,122.208,121.791Zm11.072-24.8c-8.183-10.207-20.625-16.547-35.709-18.119a6.307,6.307,0,1,1,1.479-12.398c18.608,2.059,34.613,8.036,45.522,17.434a6.3,6.3,0,1,1-10.292,12.083ZM107.292,70.436c-11.804-14.444-27.8-22.265-46.659-23.1a6.3,6.3,0,1,1,.824-12.541c20.042.948,38.926,8.476,53.8,20.5a6.3,6.3,0,1,1-8.965,9.141Z"/>
  </svg>
);

/**
 * API'den gelen JSON yapısına uygun tip tanımlamaları.
 * (İhtiyaç duyulan alanlar çekiliyor.)
 */
type LanyardData = {
  discord_user: {
    id: string;
    username: string;
    avatar: string;
    // bannerURL yoksa boş string kabul edelim
    bannerURL?: string;
    global_name?: string;
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
      large_text?: string;
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
    track_id: string;
  } | null;
  // Diğer alanlar atlanıyor...
};

type APIResponse = {
  data: LanyardData;
  success: boolean;
};

const DiscordCard: React.FC = () => {
  const [data, setData] = useState<LanyardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Milisaniyeyi okunabilir saate çeviren yardımcı fonksiyon
  const formatTimestamp = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json: APIResponse = await res.json();
        if (!json.success) {
          throw new Error('API response unsuccessful');
        }
        setData(json.data);
      } catch (err: any) {
        // Eğer hata alınırsa, kullanıcı bilgisi varsa onu ekleyelim
        const username = data?.discord_user?.username || 'undefined';
        setError(`Veriler alınamadı: ${err.message}. Kullanıcı: ${username}`);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const username = data?.discord_user?.username || 'undefined';
    return (
      <div className="max-w-md mx-auto bg-red-900/20 text-red-200 rounded-lg shadow-lg p-6">
        <p className="text-center">{error || 'Profil yüklenemedi.'}</p>
        <p className="text-center">Kullanıcı: {username}</p>
      </div>
    );
  }

  // Veriler mevcut olduğuna göre:
  const { discord_user, activities, discord_status, listening_to_spotify, spotify } = data;

  // Avatar URL'si oluşturuluyor. (Discord CDN URL'si)
  const avatarUrl = discord_user.avatar 
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=1024`
    : 'https://cdn.discordapp.com/embed/avatars/0.png';

  // Kullanıcı adı olarak display_name veya global_name varsa onları, yoksa username kullanılıyor.
  const displayName = discord_user.display_name || discord_user.global_name || discord_user.username;

  // Durum (status) rengi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-500';
      case 'dnd':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Eğer banner varsa (örneğin discord_user.bannerURL varsa) eklenebilir.
          Ancak örnek JSON'da banner bilgisi bulunmuyor. */}
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt={discord_user.username} 
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover" 
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(discord_status)} rounded-full border-2 border-gray-800`}></div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{displayName}</h2>
            {/* Kullanıcı adı / etiket göstermeye gerek yok */}
          </div>
        </div>
        <div className="mt-4">
          {listening_to_spotify && spotify ? (
            // Spotify aktifse Spotify kartı
            <div className="bg-gray-700/50 rounded-md p-4 flex items-center">
              <img 
                src={spotify.album_art_url} 
                alt={spotify.album} 
                className="w-16 h-16 rounded-md object-cover mr-4" 
              />
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{spotify.song}</h3>
                <p className="text-xs text-gray-300">{spotify.artist} &middot; {spotify.album}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTimestamp(spotify.timestamps.start)} - {formatTimestamp(spotify.timestamps.end)}
                </p>
              </div>
              <div className="ml-2">
                <SpotifyLogo className="w-6 h-6" />
              </div>
            </div>
          ) : (
            // Spotify aktif değilse ve aktiviteler varsa, ilk aktiviteyi göster
            activities.length > 0 && (
              <div className="bg-gray-700/50 rounded-md p-4 flex">
                {activities[0].assets?.large_image && (
                  <img 
                    src={`https://cdn.discordapp.com/${activities[0].assets.large_image}`} 
                    alt={activities[0].name} 
                    className="w-16 h-16 rounded-md object-cover mr-4" 
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-white">{activities[0].name}</h3>
                  {activities[0].timestamps?.start && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatTimestamp(activities[0].timestamps.start)}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default DiscordCard;
        
