import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Send } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login - will be replaced with actual auth
    setTimeout(() => {
      if (email && password) {
        toast({
          title: "Welcome back!",
          description: "Redirecting to your dashboard...",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed",
          description: "Please check your credentials and try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleTelegramLogin = () => {
    // Will be implemented with actual Telegram auth
    toast({
      title: "Telegram Login",
      description: "This feature will be implemented soon.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background">
      <Card className="w-full max-w-md p-8 shadow-card">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Ambassador Login</h1>
          <p className="text-muted-foreground text-sm">Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ambassador@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                Forgot?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="my-6">
          <Separator />
        </div>

        <Button 
          variant="outline" 
          className="w-full flex items-center justify-center gap-2"
          onClick={handleTelegramLogin}
        >
          <Send className="h-4 w-4" />
          Continue with Telegram
        </Button>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Not an ambassador?{" "}
            <Link to="/apply" className="text-primary hover:underline">
              Apply now
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <Link to="/">
            <Button variant="ghost" className="w-full">
              ← Back to Home
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
