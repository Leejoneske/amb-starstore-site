import { useEffect, useRef } from 'react';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginButtonProps {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: 'write';
  showUserPhoto?: boolean;
}

declare global {
  interface Window {
    TelegramLoginCallback?: (user: TelegramUser) => void;
  }
}

export const TelegramLoginButton = ({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 8,
  requestAccess = 'write',
  showUserPhoto = true,
}: TelegramLoginButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Set up the callback function
    window.TelegramLoginCallback = (user: TelegramUser) => {
      onAuth(user);
    };

    // Create and append the Telegram script
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', String(cornerRadius));
    script.setAttribute('data-onauth', 'TelegramLoginCallback(user)');
    script.setAttribute('data-request-access', requestAccess);
    if (showUserPhoto) {
      script.setAttribute('data-userpic', 'true');
    }
    script.async = true;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
      containerRef.current.appendChild(script);
    }

    return () => {
      delete window.TelegramLoginCallback;
    };
  }, [botName, onAuth, buttonSize, cornerRadius, requestAccess, showUserPhoto]);

  return <div ref={containerRef} className="telegram-login-container" />;
};

export type { TelegramUser };
