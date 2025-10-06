import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Users, 
  TrendingUp, 
  Gift, 
  DollarSign,
  Target,
  Trophy,
  Award,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const Home = () => {
  const tiers = [
    {
      name: "Rising Star",
      emoji: "🌱",
      commission: "5%",
      features: [
        "5% commission on all sales",
        "Monthly payouts",
        "Ambassador dashboard",
        "Marketing materials"
      ]
    },
    {
      name: "Super Star",
      emoji: "⭐",
      commission: "10%",
      features: [
        "10% commission on all sales",
        "Priority support",
        "Exclusive merchandise",
        "Featured on website"
      ]
    },
    {
      name: "Elite Star",
      emoji: "💎",
      commission: "15%",
      features: [
        "15% commission + revenue share",
        "Direct team contact",
        "Co-marketing opportunities",
        "Annual bonus potential"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Join the StarStore Ambassador Program
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Earn rewards by promoting StarStore to your community. Start earning today with our three-tier program.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/apply">
              <Button size="lg">Apply Now</Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { icon: Users, label: "Active Ambassadors", value: "500+" },
            { icon: DollarSign, label: "Total Earned", value: "$100K+" },
            { icon: TrendingUp, label: "Average Commission", value: "10%" },
            { icon: Gift, label: "Monthly Rewards", value: "Unlimited" }
          ].map((stat, index) => (
            <Card key={index} className="p-6 text-center shadow-card">
              <stat.icon className="h-8 w-8 mx-auto mb-3 text-primary" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Tiers Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Ambassador Tiers</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier, index) => (
            <Card key={index} className="p-8 shadow-card">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">{tier.emoji}</div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold text-primary">{tier.commission}</div>
                <div className="text-sm text-muted-foreground">commission</div>
              </div>
              <ul className="space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16 bg-secondary/30">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {[
            { icon: Target, title: "Apply", desc: "Submit your application" },
            { icon: Award, title: "Get Approved", desc: "Receive your unique link" },
            { icon: Zap, title: "Promote", desc: "Share with your audience" },
            { icon: Trophy, title: "Earn", desc: "Get paid monthly" }
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="inline-flex p-4 rounded-full bg-primary/10 mb-4">
                <step.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Ambassador Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { emoji: "💰", title: "Monthly Payouts", desc: "Reliable income every month" },
            { emoji: "📊", title: "Real-time Analytics", desc: "Track your performance" },
            { emoji: "🎁", title: "Exclusive Perks", desc: "Special rewards & bonuses" },
            { emoji: "🚀", title: "Marketing Support", desc: "Resources to help you succeed" },
            { emoji: "🤝", title: "Community Access", desc: "Network with other ambassadors" },
            { emoji: "📈", title: "Tier Progression", desc: "Grow your earnings over time" }
          ].map((benefit, index) => (
            <Card key={index} className="p-6 shadow-card">
              <div className="text-3xl mb-3">{benefit.emoji}</div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="p-12 text-center bg-primary text-primary-foreground shadow-card">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join hundreds of ambassadors already earning with StarStore
          </p>
          <Link to="/apply">
            <Button size="lg" variant="secondary">
              Apply Now
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 StarStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
