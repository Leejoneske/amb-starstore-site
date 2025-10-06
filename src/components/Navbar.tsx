import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-purple-600 group-hover:shadow-glow transition-all">
              <Star className="h-5 w-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold">StarStore Ambassadors</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/apply">
              <Button variant="ghost">Apply</Button>
            </Link>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
