import { useState, useEffect, useCallback } from 'react';

// Telegram WebApp types
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          start_param?: string;
        };
        ready: () => void;
        close: () => void;
        expand: () => void;
      };
    };
  }
}

export interface TelegramUserData {
  telegramId: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
}

export const useTelegramAutoFill = () => {
  const [telegramData, setTelegramData] = useState<TelegramUserData | null>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if running inside Telegram WebApp
  useEffect(() => {
    const checkTelegramContext = () => {
      try {
        const tg = window.Telegram?.WebApp;
        
        if (tg && tg.initDataUnsafe?.user) {
          const user = tg.initDataUnsafe.user;
          setIsInTelegram(true);
          setTelegramData({
            telegramId: String(user.id),
            username: user.username || '',
            firstName: user.first_name || '',
            lastName: user.last_name || '',
            fullName: [user.first_name, user.last_name].filter(Boolean).join(' ')
          });
          
          // Signal ready to Telegram
          tg.ready();
          tg.expand();
        } else {
          setIsInTelegram(false);
        }
      } catch (error) {
        console.error('Error checking Telegram context:', error);
        setIsInTelegram(false);
      } finally {
        setIsLoading(false);
      }
    };

    // Check URL params for data from redirect
    const urlParams = new URLSearchParams(window.location.search);
    const tgId = urlParams.get('tg_id');
    const tgUsername = urlParams.get('tg_username');
    const tgName = urlParams.get('tg_name');

    if (tgId) {
      setTelegramData({
        telegramId: tgId,
        username: tgUsername || '',
        firstName: tgName?.split(' ')[0] || '',
        lastName: tgName?.split(' ').slice(1).join(' ') || '',
        fullName: tgName || ''
      });
      setIsLoading(false);
      
      // Clean up URL
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
      return;
    }

    // Small delay to ensure Telegram script loads
    const timer = setTimeout(checkTelegramContext, 100);
    return () => clearTimeout(timer);
  }, []);

  // Generate Telegram bot link with redirect back to apply page
  const getTelegramConnectUrl = useCallback(() => {
    const botUsername = 'TgStarStore_bot';
    const redirectUrl = encodeURIComponent(`${window.location.origin}/apply`);
    // Start param includes action and redirect
    return `https://t.me/${botUsername}?start=amb_connect_${redirectUrl}`;
  }, []);

  // Alternative: Direct API call to StarStore to get user data
  const fetchUserFromStarStore = useCallback(async (telegramId: string): Promise<TelegramUserData | null> => {
    try {
      const response = await fetch(`https://starstore.site/api/users/${telegramId}`, {
        headers: {
          'x-api-key': 'amb_starstore_secure_key_2024',
          'User-Agent': 'Ambassador-Dashboard'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.user) {
          return {
            telegramId: String(data.user.id),
            username: data.user.username || '',
            firstName: data.user.first_name || data.user.firstName || '',
            lastName: data.user.last_name || data.user.lastName || '',
            fullName: data.user.username || String(data.user.id)
          };
        }
      }
    } catch (error) {
      console.error('Error fetching user from StarStore:', error);
    }
    return null;
  }, []);

  return {
    telegramData,
    isInTelegram,
    isLoading,
    getTelegramConnectUrl,
    fetchUserFromStarStore,
    setTelegramData
  };
};
