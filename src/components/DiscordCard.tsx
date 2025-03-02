import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// ========================== TİP TANIMLARI ==========================
type DiscordUser = {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
  public_flags: number;
  premium_type: number;
  flags: number;
  banner: string | null;
  accent_color: number | null;
  global_name: string;
  avatar_decoration_data: any;
  banner_color: string | null;
  mfa_enabled: boolean;
  locale: string;
  premium_type_name: string;
  avatar_url: string;
  display_name: string;
};

type SpotifyData = {
  track_id: string;
  timestamps: {
    start: number;
    end: number;
  };
  album: string;
  album_art_url: string;
  artist: string;
  song: string;
};

type Activity = {
  type: number;
  state: string;
  name: string;
  id: string;
  emoji?: {
    name: string;
    animated: boolean;
    id: string;
  };
  created_at: number;
  session_id?: string;
  details?: string;
  timestamps?: {
    start: number;
    end?: number;
  };
  assets?: {
    large_text?: string;
    small_text?: string;
    large_image?: string;
    small_image?: string;
  };
  buttons?: string[];
  application_id?: string;
  flags?: number;
  party?: {
    id: string;
  };
  sync_id?: string;
};

type LanyardResponse = {
  success: boolean;
  data: {
    active_on_discord_mobile: boolean;
    active_on_discord_desktop: boolean;
    listening_to_spotify: boolean;
    kv: Record<string, string>;
    spotify: SpotifyData | null;
    discord_user: DiscordUser;
    discord_status: 'online' | 'idle' | 'dnd' | 'offline';
    activities: Activity[];
  };
};

// ========================== DURUM İKONLARI ==========================
const StatusIndicator = ({ status }: { status: string }) => {
  const getStatusStyle = () => {
    switch (status) {
      case 'online':
        return 'bg-[#23A55A] border-[#313338]';
      case 'idle':
        return 'bg-[#F0B232] border-[#313338]';
      case 'dnd':
        return 'bg-[#F23F43] border-[#313338]';
      default:
        return 'bg-[#80848E] border-[#313338]';
    }
  };

  return (
    <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 ${getStatusStyle()}`}>
      {status === 'offline' && (
        <div className="absolute inset-0.5 rounded-full bg-[#313338] border border-[#80848E]" />
      )}
    </div>
  );
};

// ========================== ANA BİLEŞEN ==========================
const DiscordProfileCard = () => {
  const [profileData, setProfileData] = useState<LanyardResponse['data'] | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zaman güncelleme efekti
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Veri çekme efekti
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        const data: LanyardResponse = await response.json();
        
        if (!data.success) throw new Error('API yanıtı başarısız');
        
        setProfileData(data.data);
        setError(null);
      } catch (err) {
        setError('Profil verileri alınamadı');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  // ========================== RENDER FONKSİYONLARI ==========================
  const renderCustomStatus = () => {
    const customStatus = profileData?.activities.find(a => a.type === 4);
    if (!customStatus?.state) return null;

    return (
      <div className="absolute -top-14 right-0 flex items-center gap-1.5">
        <div className="relative">
          <div className="absolute -left-3.5 top-2.5 w-4 h-4 border-l-2 border-t-2 border-[#41434A] rounded-tl-full transform rotate-45" />
          <div className="bg-[#41434A] text-white px-3 py-1.5 rounded-lg text-sm max-w-[200px] break-words shadow-lg">
            {customStatus.state}
          </div>
        </div>
      </div>
    );
  };

  const renderSpotifyActivity = () => {
    if (!profileData?.listening_to_spotify || !profileData.spotify) return null;

    const { start, end } = profileData.spotify.timestamps;
    const progress = ((currentTime - start) / (end - start)) * 100;

    return (
      <div className="mt-4 bg-[#41434A] rounded-lg p-3">
        <div className="flex items-center gap-3">
          <img
            src={profileData.spotify.album_art_url}
            alt="Album Art"
            className="w-12 h-12 rounded"
          />
          <div className="flex-1">
            <div className="text-white font-medium text-sm">{profileData.spotify.song}</div>
            <div className="text-[#B5BAC1] text-xs mt-1">
              {profileData.spotify.artist} • {profileData.spotify.album}
            </div>
            <div className="mt-2 relative h-1 bg-[#313338] rounded-full">
              <div
                className="absolute h-full bg-[#1DB954] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ========================== ANA RENDER ==========================
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-[#313338] rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-[#41434A] rounded w-3/4 mb-4" />
        <div className="h-4 bg-[#41434A] rounded w-1/2" />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="max-w-md mx-auto bg-[#313338] rounded-xl p-6 text-red-400 text-center">
        {error || 'Profil yüklenirken hata oluştu'}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-[#313338] rounded-xl shadow-2xl overflow-hidden"
    >
      {profileData.discord_user.banner && (
        <div
          className="h-28 bg-cover bg-center"
          style={{ backgroundImage: `url(https://cdn.discordapp.com/banners/${profileData.discord_user.id}/${profileData.discord_user.banner}.webp?size=600)` }}
        />
      )}

      <div className="p-5 relative">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img
              src={`https://cdn.discordapp.com/avatars/${profileData.discord_user.id}/${profileData.discord_user.avatar}.webp?size=256`}
              alt="Avatar"
              className="w-20 h-20 rounded-full border-[3px] border-[#313338]"
            />
            <StatusIndicator status={profileData.discord_status} />
            {renderCustomStatus()}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">
              {profileData.discord_user.global_name || profileData.discord_user.username}
            </h2>
            <p className="text-[#B5BAC1] text-sm mt-1">
              @{profileData.discord_user.username}
            </p>
            
            <div className="mt-3 flex gap-1.5">
              {[1, 2, 4, 8].map(bit => (
                <img
                  key={bit}
                  src={`/badges/badge-${bit}.png`}
                  className="w-6 h-6 rounded-sm"
                  alt="Badge"
                />
              ))}
            </div>
          </div>
        </div>

        {renderSpotifyActivity()}
      </div>
    </motion.div>
  );
};

export default DiscordProfileCard;
