// src/components/DiscordCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Globe, Mail, MessageCircle } from 'lucide-react';

type DiscordActivity = {
  name: string;
  type: number;
  details: string;
  state: string;
  timestamps: {
    start: string;
    end: string | null;
  };
  assets: {
    large_image: string;
    large_text: string;
    small_image: string | null;
    small_text: string;
  };
  applicationId: string | null;
};

type DiscordUser = {
  id: string;
  username: string;
  tag: string;
  avatarURL: string;
  bannerURL: string;
  status: string;
  activities: DiscordActivity[];
};

type SpotifyData = {
  title: string;
  artist: string;
  albumName: string;
  albumArtURL: string;
  trackId: string;
  timestamps: {
    start: string;
    end: string;
  };
};

type APIResponse = {
  user: DiscordUser;
  spotify: SpotifyData | null;
  customStatus: any;
};

const SpotifyLogo: React.FC<{ className?: string }> = ({ className }) => (
  // Küçük Spotify logosu (inline SVG)
  <svg className={className} role="img" viewBox="0 0 168 168" xmlns="http://www.w3.org/2000/svg">
    <title>Spotify</title>
    <path fill="#1ED760" d="M84,0a84,84,0,1,0,84,84A84.095,84.095,0,0,0,84,0Zm38.208,121.791a6.295,6.295,0,0,1-8.651,1.722c-23.685-14.537-53.54-17.835-88.2-9.77a6.3,6.3,0,1,1-2.836-12.207c38.251-9.693,71.156-6.072,97.871,11.318A6.295,6.295,0,0,1,122.208,121.791Zm11.072-24.8c-8.183-10.207-20.625-16.547-35.709-18.119a6.307,6.307,0,1,1,1.479-12.398c18.608,2.059,34.613,8.036,45.522,17.434a6.3,6.3,0,1,1-10.292,12.083ZM107.292,70.436c-11.804-14.444-27.8-22.265-46.659-23.1a6.3,6.3,0,1,1,.824-12.541c20.042.948,38.926,8.476,53.8,20.5a6.3,6.3,0,1,1-8.965,9.141Z"/>
  </svg>
);

const DiscordCard: React.FC = () => {
  const [data, setData] = useState<APIResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Zaman damgasını okunabilir saate çeviren yardımcı fonksiyon
  const formatTimestamp = (timestamp: string) => {
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
        const res = await fetch('https://api.setscript.com/users/991409937022468169');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const json: APIResponse = await res.json();
        setData(json);
      } catch (err: any) {
        // Eğer fetch başarısız olursa; data henüz null olduğu için kullanıcı adı "undefined" olarak gösterilecek.
        setError(`Veriler alınamadı: ${err.message}. Kullanıcı: ${data?.user.username ?? "undefined"}`);
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
    return (
      <div className="max-w-md mx-auto bg-red-900/20 text-red-200 rounded-lg shadow-lg p-6">
        <p className="text-center">{error || 'Profil yüklenemedi.'}</p>
      </div>
    );
  }

  const { user, spotify } = data;

  // Durum (status) rengi belirleme
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Avatar URL’si
  const avatarUrl = user.avatarURL || 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {/* Banner (varsa) */}
      {user.bannerURL && user.bannerURL !== "" && (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{
            backgroundImage: `url(${user.bannerURL})`,
            backgroundColor: '#5865F2'
          }}
        />
      )}
      
      <div className="p-6">
        <div className="flex items-center">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={user.username}
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(user.status)} rounded-full border-2 border-gray-800`}></div>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold text-white">{user.username}</h2>
            <p className="text-gray-400 text-sm">#{user.tag}</p>
          </div>
        </div>

        {/* Spotify aktifse Spotify kartı */}
        {spotify ? (
          <div className="mt-4 bg-gray-700/50 rounded-md p-4 flex items-center">
            <img
              src={spotify.albumArtURL}
              alt={spotify.albumName}
              className="w-16 h-16 rounded-md object-cover mr-4"
            />
            <div className="flex-1">
              <h3 className="text-sm font-bold text-white">{spotify.title}</h3>
              <p className="text-xs text-gray-300">
                {spotify.artist} &middot; {spotify.albumName}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatTimestamp(spotify.timestamps.start)} - {formatTimestamp(spotify.timestamps.end)}
              </p>
            </div>
            <div className="ml-2">
              <SpotifyLogo className="w-6 h-6" />
            </div>
          </div>
        ) : (
          // Spotify verisi yoksa, aktiviteleri kontrol et ve ilkini göster
          user.activities && user.activities.length > 0 && (
            <div className="mt-4 bg-gray-700/50 rounded-md p-4 flex">
              {user.activities[0].assets.large_image && (
                <img
                  src={user.activities[0].assets.large_image}
                  alt={user.activities[0].name}
                  className="w-16 h-16 rounded-md object-cover mr-4"
                />
              )}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white">{user.activities[0].name}</h3>
                <p className="text-xs text-gray-300">{user.activities[0].details}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {user.activities[0].state !== "NaN" ? user.activities[0].state : ""}
                  {user.activities[0].timestamps.start && (
                    <> &middot; {formatTimestamp(user.activities[0].timestamps.start)}</>
                  )}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
};

export default DiscordCard;
    
