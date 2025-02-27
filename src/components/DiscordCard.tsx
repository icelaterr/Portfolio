// src/components/DiscordCard.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Code, Globe, Mail, MessageCircle } from 'lucide-react';

type DiscordActivity = {
  name: string;
  type: number;
  state?: string;
  details?: string;
};

type DiscordProfile = {
  id: string;
  username: string;
  discriminator: string;
  avatar: string;
  banner: string | null;
  accent_color: number | null;
  status: string;
  activities: DiscordActivity[];
};

const DiscordCard: React.FC = () => {
  const [profile, setProfile] = useState<DiscordProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/discord-profile');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: DiscordProfile = await response.json();
      setProfile(data);
    } catch (err: any) {
      setError(`Failed to fetch Discord profile: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const intervalId = setInterval(fetchProfile, 60000);
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
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

  if (error || !profile) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-900/20 text-red-200 rounded-lg shadow-lg p-6">
        <p className="text-center">{error || 'Discord profile could not be loaded.'}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'idle': return 'Idle';
      case 'dnd': return 'Do Not Disturb';
      case 'offline': return 'Offline';
      default: return 'Unknown';
    }
  };

  const getActivityType = (type: number) => {
    switch (type) {
      case 0: return 'Playing';
      case 1: return 'Streaming';
      case 2: return 'Listening to';
      case 3: return 'Watching';
      case 4: return 'Custom';
      case 5: return 'Competing in';
      default: return '';
    }
  };

  const avatarUrl = profile.avatar || 'https://cdn.discordapp.com/embed/avatars/0.png';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {profile.banner && (
        <div
          className="h-24 w-full bg-cover bg-center"
          style={{
            backgroundColor: profile.accent_color
              ? `#${profile.accent_color.toString(16).padStart(6, '0')}`
              : '#5865F2',
            backgroundImage: `url(${profile.banner})`
          }}
        />
      )}

      <div className="p-6">
        <div className="flex items-start">
          <div className="relative">
            <img
              src={avatarUrl}
              alt={profile.username}
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(profile.status)} rounded-full border-2 border-gray-800`}></div>
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{profile.username}</h2>
              <div className="flex space-x-2">
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  <Mail size={18} />
                </a>
                <a
                  href={`https://discord.com/users/${profile.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <MessageCircle size={18} />
                </a>
                <a
                  href="https://github.com/icelaterdc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <Code size={18} />
                </a>
                <a href="#projects" className="text-gray-400 hover:text-white transition-colors">
                  <Globe size={18} />
                </a>
              </div>
            </div>

            <div className="flex items-center mt-1">
              <span className={`inline-block w-2 h-2 ${getStatusColor(profile.status)} rounded-full mr-2`}></span>
              <p className="text-gray-400">{getStatusText(profile.status)} - Full-Stack Developer</p>
            </div>

            {profile.activities.length > 0 ? (
              <div className="mt-4 bg-gray-700/50 rounded-md p-3">
                {profile.activities[0].type !== 4 && (
                  <p className="text-sm text-gray-300 font-medium">
                    {getActivityType(profile.activities[0].type)} {profile.activities[0].name}
                  </p>
                )}
                {profile.activities[0].details && (
                  <p className="text-xs text-gray-400 mt-1">{profile.activities[0].details}</p>
                )}
                {profile.activities[0].state && (
                  <p className="text-xs text-gray-400">{profile.activities[0].state}</p>
                )}
              </div>
            ) : (
              <div className="mt-4 bg-gray-700/50 rounded-md p-3">
                <p className="text-sm text-gray-300 font-medium">Currently not doing anything</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscordCard;
