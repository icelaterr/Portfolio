import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchGitHubRepos } from '../api/github';
import { GitHubRepo } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { Star, GitFork, Clock, Code, ExternalLink } from 'lucide-react';

const GitHubRepos: React.FC = () => {
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const getRepos = async () => {
      try {
        setLoading(true);
        const reposData = await fetchGitHubRepos();
        setRepos(reposData);
      } catch (err) {
        setError('Failed to fetch GitHub repositories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getRepos();
  }, []);

  const filteredRepos = repos.filter(repo => {
    if (filter === 'all') return true;
    if (filter === 'forked' && repo.fork) return true;
    if (filter === 'original' && !repo.fork) return true;
    if (filter === repo.language?.toLowerCase()) return true;
    return false;
  });

  const languages = [...new Set(repos.map(repo => repo.language).filter(Boolean))];

  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: 'bg-yellow-300',
      TypeScript: 'bg-blue-500',
      HTML: 'bg-orange-500',
      CSS: 'bg-purple-500',
      Python: 'bg-green-500',
      Java: 'bg-red-500',
      'C#': 'bg-green-600',
      PHP: 'bg-indigo-500',
      Ruby: 'bg-red-600',
      Go: 'bg-blue-400',
      Rust: 'bg-orange-600',
      Swift: 'bg-orange-500',
      Kotlin: 'bg-purple-600',
      Dart: 'bg-blue-300',
      Shell: 'bg-gray-500',
    };

    return colors[language] || 'bg-gray-400';
  };

  if (loading) {
    return (
      <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-4"></div>
            <div className="flex justify-between mt-6">
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-red-900/20 text-red-200 rounded-lg shadow-lg p-6">
        <p className="text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } transition-colors`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('original')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'original' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } transition-colors`}
        >
          Original
        </button>
        <button
          onClick={() => setFilter('forked')}
          className={`px-3 py-1 rounded-full text-sm ${
            filter === 'forked' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          } transition-colors`}
        >
          Forked
        </button>
        {languages.map(language => (
          language && (
            <button
              key={language}
              onClick={() => setFilter(language.toLowerCase())}
              className={`px-3 py-1 rounded-full text-sm ${
                filter === language.toLowerCase() ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              } transition-colors flex items-center`}
            >
              <span className={`w-2 h-2 rounded-full ${getLanguageColor(language)} mr-1.5`}></span>
              {language}
            </button>
          )
        ))}
      </div>

      {filteredRepos.length === 0 ? (
        <p className="text-center text-gray-400">No repositories found matching the selected filter.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepos.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {repo.name}
                  </h3>
                  {repo.fork && (
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Fork</span>
                  )}
                </div>
                
                <p className="text-gray-400 text-sm mt-2 line-clamp-2 h-10">
                  {repo.description || 'No description provided'}
                </p>
                
                {repo.language && (
                  <div className="flex items-center mt-4">
                    <span className={`w-3 h-3 rounded-full ${getLanguageColor(repo.language)}`}></span>
                    <span className="ml-2 text-sm text-gray-300">{repo.language}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between mt-4 text-gray-400 text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Star size={14} className="mr-1" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                    <div className="flex items-center">
                      <GitFork size={14} className="mr-1" />
                      <span>{repo.forks_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock size={14} className="mr-1" />
                    <span>{formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
                  <a
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Code size={14} className="mr-1" />
                    View Code
                  </a>
                  
                  {repo.homepage && (
                    <a
                      href={repo.homepage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GitHubRepos;