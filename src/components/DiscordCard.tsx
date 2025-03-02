import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/* === GÜNCELLENMİŞ DURUM İKONLARI (DISCORD 2024 TASARIMI) === */
const OnlineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#23A55A" />
  </svg>
);

const IdleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16">
    <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0 8 8 0 0 1-16 0z" fill="#F0B232" />
    <path d="M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9z" fill="#F0B232" />
  </svg>
);

const DndIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="8" fill="#F23F43" />
    <rect x="3" y="7" width="10" height="2" fill="#18191C" rx="1" />
  </svg>
);

const OfflineIcon = () => (
  <svg width="18" height="18" viewBox="0 0 16 16">
    <circle cx="8" cy="8" r="6.25" fill="none" stroke="#80848E" strokeWidth="3" />
  </svg>
);

/* === ÖZEL DURUM BALONCUĞU (DISCORD STILI) === */
const StatusBubble = ({ text }: { text: string }) => (
  <div className="absolute -top-[4.5rem] right-3">
    <div className="relative flex items-start">
      {/* Kıvrımlı İp */}
      <div className="w-6 h-8 -mr-3 -mt-1 relative">
        <div className="absolute w-4 h-full border-l-2 border-t-2 border-gray-600 rounded-tl-full" 
             style={{ transform: 'rotate(55deg) translate(3px,-1px)' }} />
      </div>
      
      {/* Baloncuk */}
      <div className="bg-[#41434A] text-white text-[13px] px-3 py-1.5 rounded-lg shadow-xl max-w-[180px] 
                      break-words leading-tight tracking-tight font-medium whitespace-normal
                      before:content-[''] before:absolute before:-left-2 before:top-3 before:w-3 before:h-3
                      before:bg-[#41434A] before:rotate-45">
        {text}
      </div>
    </div>
  </div>
);

/* === ANA COMPONENT === */
const DiscordCard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('https://api.lanyard.rest/v1/users/991409937022468169');
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="max-w-md mx-auto bg-[#313338] rounded-xl p-6 animate-pulse text-white">
      <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
      <div className="h-4 bg-gray-700 rounded w-1/2" />
    </div>
  );

  if (!data) return (
    <div className="max-w-md mx-auto bg-red-900/20 text-red-200 rounded-xl p-6 text-center">
      Profil yüklenemedi
    </div>
  );

  const { discord_user, activities, discord_status } = data;
  const displayName = discord_user.display_name || discord_user.global_name || discord_user.username;
  const avatarUrl = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.webp?size=256`;
  const customStatus = activities.find((a: any) => a.id === "custom" && a.state);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto bg-[#313338] rounded-xl shadow-2xl overflow-hidden"
    >
      {discord_user.banner && (
        <div className="h-28 bg-cover bg-center" 
             style={{ backgroundImage: `url(https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.webp?size=600)` }} />
      )}

      <div className="p-5 relative">
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <img src={avatarUrl} alt="Avatar" className="w-20 h-20 rounded-full border-[3px] border-[#313338]" />
            
            <div className="absolute bottom-0 right-0 bg-[#313338] p-1 rounded-full">
              {(() => {
                switch(discord_status) {
                  case 'online': return <OnlineIcon />;
                  case 'idle': return <IdleIcon />;
                  case 'dnd': return <DndIcon />;
                  default: return <OfflineIcon />;
                }
              })()}
            </div>

            {customStatus?.state && <StatusBubble text={customStatus.state} />}
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white">{displayName}</h2>
            <p className="text-[#B5BAC1] text-sm mt-1">@{discord_user.username}</p>
            
            <div className="mt-3 flex gap-1">
              {[1, 2, 4, 8].map((bit) => (
                <img key={bit} src={`/badges/${bit}.png`} 
                     className="w-5 h-5 rounded-sm" alt="Badge" />
              ))}
            </div>
          </div>
        </div>

        {/* Spotify Aktivitesi */}
        {data.listening_to_spotify && (
          <div className="mt-4 bg-[#41434A] rounded-lg p-3">
            <div className="flex items-center gap-3">
              <img src={data.spotify.album_art_url} 
                   className="w-12 h-12 rounded" 
                   alt="Album Art" />
              <div className="flex-1">
                <div className="text-white font-medium text-sm">{data.spotify.song}</div>
                <div className="text-[#B5BAC1] text-xs mt-1">
                  {data.spotify.artist} • {data.spotify.album}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default DiscordCard;
