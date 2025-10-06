import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Star, TrendingUp, Users, Award, DollarSign, Target } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-stars.jpg";

const Home = () => {
  const tiers = [
    {
      name: "Rising Star",
      icon: Star,
      color: "from-purple-500 to-indigo-500",
      commission: "5%",
      perks: [
        "Welcome starter kit",
        "5% commission on referrals",
        "Access to promotional materials",
        "Monthly newsletters",
        "Ambassador Discord access"
      ]
    },
    {
      name: "Super Star",
      icon: TrendingUp,
      color: "from-indigo-500 to-blue-500",
      commission: "10%",
      perks: [
        "Everything in Rising Star",
        "10% commission on referrals",
        "Priority support",
        "Exclusive merchandise",
        "Featured on our website",
        "Quarterly performance bonuses"
      ]
    },
    {
      name: "Elite Star",
      icon: Award,
      color: "from-yellow-400 to-orange-500",
      commission: "15%",
      perks: [
        "Everything in Super Star",
        "15% commission + revenue share",
        "1-on-1 strategy sessions",
        "Custom promotional codes",
        "Co-marketing opportunities",
        "Annual retreat invitation",
        "Lifetime tier status"
      ]
    }
  ];

  const benefits = [
    {
      icon: DollarSign,
      title: "Monthly Payouts",
      description: "Get paid every month via your preferred method. No minimum threshold."
    },
    {
      icon: Users,
      title: "Growing Community",
      description: "Join 500+ ambassadors worldwide promoting StarStore together."
    },
    {
      icon: Target,
      title: "Clear Goals",
      description: "Track your performance with real-time analytics and transparent metrics."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20" />
        
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-block">
              <span className="text-accent font-semibold tracking-wider uppercase text-sm">
                StarStore Ambassador Program
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Become a{" "}
              <span className="bg-gradient-to-r from-primary via-purple-500 to-accent bg-clip-text text-transparent">
                Star Ambassador
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
              Earn monthly commissions, get exclusive perks, and join an elite community 
              promoting the future of Telegram Stars & Premium subscriptions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/apply">
                <Button size="lg" className="text-lg px-8 shadow-glow">
                  Apply Now
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  Ambassador Login
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-center gap-8 pt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>500+ Ambassadors</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span>$50K+ Paid Monthly</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Tiers, Unlimited Potential
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Progress through our ambassador tiers and unlock bigger rewards, exclusive perks, and enhanced benefits.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {tiers.map((tier, index) => {
              const Icon = tier.icon;
              return (
                <Card 
                  key={tier.name} 
                  className={`p-8 glass-card hover:scale-105 transition-all duration-300 ${
                    index === 2 ? 'border-gold shadow-glow' : ''
                  }`}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${tier.color} mb-6`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-3xl font-bold text-primary mb-6">
                    {tier.commission}
                    <span className="text-sm text-muted-foreground font-normal"> commission</span>
                  </div>
                  
                  <ul className="space-y-3">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2">
                        <Star className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{perk}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Join StarStore Ambassadors?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="text-center space-y-4">
                  <div className="inline-flex p-4 rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Card className="p-12 glass-card border-primary/20">
            <h2 className="text-4xl font-bold mb-4">Ready to Become a Star?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Applications are reviewed within 48 hours. Join our elite community today.
            </p>
            <Link to="/apply">
              <Button size="lg" className="text-lg px-12 shadow-glow">
                Start Your Application
              </Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
