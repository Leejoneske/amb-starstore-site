import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Sparkles, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been signed out successfully.",
    });
  };

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-primary group-hover:text-primary/80 transition-colors" />
            <div className="text-lg font-semibold">StarStore Ambassadors</div>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard"><Button variant="default">Dashboard</Button></Link>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/apply"><Button variant="default">Apply Now</Button></Link>
                <Link to="/auth"><Button variant="outline">Sign In</Button></Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
