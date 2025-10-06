import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold">StarStore Ambassador Program</span>
          </Link>

          <div className="flex items-center gap-3">
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
