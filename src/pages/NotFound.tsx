import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-background">
      <div className="text-center max-w-md">
        <p className="text-sm font-medium text-primary mb-4">404</p>
        <h1
          className="text-3xl md:text-4xl font-bold text-foreground mb-4"
          style={{ fontFamily: "'Libre Baskerville', serif", lineHeight: 1.15 }}
        >
          Page not found
        </h1>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild>
            <Link to="/">Back to Home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </main>
  );
};

export default NotFound;
