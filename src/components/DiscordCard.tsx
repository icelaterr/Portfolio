import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchDiscordUser } from '../api/discord';
import { DiscordUser } from '../types';
import { Code, Globe, Mail, MessageCircle } from 'lucide-react';

const DiscordCard: React.FC = () => {
  const [discordUser, setDiscordUser] = useState<DiscordUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getDiscordUser = async () => {
      try {
        setLoading(true);
        const userData = await fetchDiscordUser();
        setDiscordUser(userData);
      } catch (err) {
        setError('Failed to fetch Discord profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Initial fetch
    getDiscordUser();

    // Poll for updated Discord status every minute
    const intervalId = setInterval(() => {
      getDiscordUser();
    }, 60000);

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

  if (error || !discordUser) {
    return (
      <div className="w-full max-w-md mx-auto bg-red-900/20 text-red-200 rounded-lg shadow-lg p-6">
        <p className="text-center">Failed to load Discord profile</p>
      </div>
    );
  }

  const getStatusColor = (status?: string) => {
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

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'idle':
        return 'Idle';
      case 'dnd':
        return 'Do Not Disturb';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const getActivityType = (type: number) => {
    switch (type) {
      case 0:
        return 'Playing';
      case 1:
        return 'Streaming';
      case 2:
        return 'Listening to';
      case 3:
        return 'Watching';
      case 4:
        return 'Custom';
      case 5:
        return 'Competing in';
      default:
        return '';
    }
  };

  const avatarUrl = discordUser.avatar
    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${
        discordUser.avatar.startsWith('a_') ? 'gif' : 'png'
      }?size=256`
    : `https://cdn.discordapp.com/embed/avatars/0.png`;

  const hasActivity = discordUser.activities && discordUser.activities.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg overflow-hidden"
    >
      {discordUser.banner && (
        <div 
          className="h-24 w-full bg-cover bg-center" 
          style={{ 
            backgroundColor: discordUser.accent_color 
              ? `#${discordUser.accent_color.toString(16).padStart(6, '0')}` 
              : '#5865F2',
            backgroundImage: discordUser.banner 
              ? `url(https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.png?size=600)` 
              : 'none'
          }}
        />
      )}
      
      <div className="p-6">
        <div className="flex items-start">
          <div className="relative">
            <img 
              src={avatarUrl} 
              alt={discordUser.username} 
              className="w-20 h-20 rounded-full border-4 border-gray-800 object-cover"
            />
            <div className={`absolute bottom-0 right-0 w-5 h-5 ${getStatusColor(discordUser.status)} rounded-full border-2 border-gray-800`}></div>
          </div>
          
          <div className="ml-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{discordUser.username}</h2>
              <div className="flex space-x-2">
                <a href="#contact" className="text-gray-400 hover:text-white transition-colors">
                  <Mail size={18} />
                </a>
                <a href="https://discord.com/users/991409937022468169" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <MessageCircle size={18} />
                </a>
                <a href="https://github.com/icelaterdc" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  <Code size={18} />
                </a>
                <a href="#projects" className="text-gray-400 hover:text-white transition-colors">
                  <Globe size={18} />
                </a>
              </div>
            </div>
            
            <div className="flex items-center mt-1">
              <span className={`inline-block w-2 h-2 ${getStatusColor(discordUser.status)} rounded-full mr-2`}></span>
              <p className="text-gray-400">{getStatusText(discordUser.status)} - Full-Stack Developer</p>
            </div>
            
            {hasActivity ? (
              <div className="mt-4 bg-gray-700/50 rounded-md p-3">
                {discordUser.activities[0].type !== 4 && (
                  <p className="text-sm text-gray-300 font-medium">
                    {getActivityType(discordUser.activities[0].type)} {discordUser.activities[0].name}
                  </p>
                )}
                {discordUser.activities[0].details && (
                  <p className="text-xs text-gray-400 mt-1">{discordUser.activities[0].details}</p>
                )}
                {discordUser.activities[0].state && (
                  <p className="text-xs text-gray-400">{discordUser.activities[0].state}</p>
                )}
              </div>
            ) : (
              <div className="mt-4 bg-gray-700/50 rounded-md p-3">
                <p className="text-sm text-gray-300 font-medium">
                  Currently not doing anything
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DiscordCard;
    
