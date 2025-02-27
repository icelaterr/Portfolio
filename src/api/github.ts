import axios from 'axios';
import { GitHubRepo } from '../types';

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_USERNAME = 'icelaterdc';

export const fetchGitHubRepos = async (): Promise<GitHubRepo[]> => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}/repos`, {
      params: {
        sort: 'updated',
        per_page: 100
      },
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub repos:', error);
    return [];
  }
};

export const fetchGitHubUser = async () => {
  try {
    const response = await axios.get(`${GITHUB_API_URL}/users/${GITHUB_USERNAME}`, {
      headers: {
        Accept: 'application/vnd.github.v3+json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return null;
  }
};