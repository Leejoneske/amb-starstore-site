import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.warn('404 Error: User attempted to access non-existent route', { 
      pathname: location.pathname,
      referrer: document.referrer 
    });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <img 
            src="/favicon.ico" 
            alt="StarStore" 
            className="w-12 h-12"
          />
          <h1 className="text-4xl font-bold">404</h1>
        </div>
        <p className="mb-6 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/80 transition-colors">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
