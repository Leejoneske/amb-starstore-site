import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Shield,
  Zap,
  Lock,
  Crown,
  Rocket,
  Trophy,
  Clock,
  BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const coreBenefits = [
    {
      icon: <Lock className="h-7 w-7" />,
      title: "Exclusive Access",
      description: "Private ambassador channels, early product access, and closed community events",
      features: ["Private Telegram channels", "Early product launches", "Exclusive events"],
      gradient: "from-blue-500/10 to-indigo-500/10",
      iconBg: "bg-blue-500/10 text-blue-600"
    },
    {
      icon: <Crown className="h-7 w-7" />,
      title: "Premium Rewards",
      description: "Unique merchandise, special bonuses, and enhanced referral conditions",
      features: ["Custom ambassador merch", "Performance bonuses", "Higher commission rates"],
      gradient: "from-purple-500/10 to-pink-500/10",
      iconBg: "bg-purple-500/10 text-purple-600"
    },
    {
      icon: <Rocket className="h-7 w-7" />,
      title: "Growth Program",
      description: "Share your expertise and grow with us through our enhanced ambassador program",
      features: ["Personal growth opportunities", "Skill development", "Community recognition"],
      gradient: "from-emerald-500/10 to-teal-500/10",
      iconBg: "bg-emerald-500/10 text-emerald-600"
    }
  ];

  const earningRanges = [
    { tier: "Explorer", range: "$30+", referrals: "30", commission: "15%", icon: "🧭", color: "from-slate-500 to-slate-600" },
    { tier: "Connector", range: "$60+", referrals: "50", commission: "18%", icon: "🤝", color: "from-blue-500 to-blue-600" },
    { tier: "Pioneer", range: "$80+", referrals: "70", commission: "20%", icon: "🚀", color: "from-violet-500 to-violet-600" },
    { tier: "Elite", range: "$110+", referrals: "100", commission: "25%", icon: "🏆", color: "from-amber-500 to-amber-600" }
  ];

  const applicationSteps = [
    {
      step: "01",
      title: "Submit Application",
      description: "Complete our streamlined application form with your details and community information"
    },
    {
      step: "02", 
      title: "Review Process",
      description: "Our team evaluates your application and provides feedback within 24-48 hours"
    },
    {
      step: "03",
      title: "Onboarding", 
      description: "Receive your unique referral links, access to resources, and welcome kit"
    },
    {
      step: "04",
      title: "Start Earning",
      description: "Begin sharing with your community and track your earnings in real-time"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - More refined and professional */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60" />
        
        <div className="container mx-auto px-4 py-24 lg:py-36 relative">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/80 backdrop-blur-sm border border-border/50">
              <img 
                src="/favicon.ico" 
                alt="StarStore" 
                className="w-5 h-5"
              />
              <span className="text-sm font-medium">StarStore Ambassador Program</span>
            </div>
            
            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
                Build Your Future With
                <span className="block mt-2 bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                  StarStore
                </span>
              </h1>
              
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Join an elite network of ambassadors driving growth in digital commerce. 
                Access exclusive tools, premium rewards, and a supportive community.
              </p>
            </div>

            {/* CTA Group */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" asChild className="text-base px-8 py-6 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                <Link to="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
                <a href="https://t.me/StarStore_app" target="_blank" rel="noopener noreferrer">
                  <Zap className="mr-2 h-5 w-5" />
                  Learn More
                </a>
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 pt-8 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>500+ Active Ambassadors</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>25+ Countries</span>
              </div>
              <div className="hidden md:flex items-center gap-2 text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>$250K+ Paid Out</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-1">
              <BarChart3 className="h-3 w-3 mr-2" />
              Program Benefits
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">What You'll Unlock</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exclusive access, premium rewards, and growth opportunities designed for ambitious professionals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {coreBenefits.map((benefit, index) => (
              <Card 
                key={index} 
                className={`p-8 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br ${benefit.gradient}`}
              >
                <div className="space-y-6">
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${benefit.iconBg}`}>
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground mb-5 leading-relaxed">{benefit.description}</p>
                    <ul className="space-y-3">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earning Potential Section */}
      <section className="py-24 bg-muted/30 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-1">
              <DollarSign className="h-3 w-3 mr-2" />
              Compensation Structure
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Your Earning Potential</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Transparent tier progression with increasing rewards as you grow
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-12">
            {earningRanges.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  tier.tier === 'Elite' 
                    ? 'ring-2 ring-amber-500/50 shadow-lg shadow-amber-500/10' 
                    : 'hover:-translate-y-1'
                }`}
              >
                {tier.tier === 'Elite' && (
                  <div className="absolute top-0 right-0 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium rounded-bl-lg">
                    Top Tier
                  </div>
                )}
                
                <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
                
                <div className="p-6 space-y-5">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{tier.icon}</span>
                    <span className="font-semibold text-lg">{tier.tier}</span>
                  </div>

                  <div>
                    <div className="text-4xl font-bold text-foreground">
                      {tier.range}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      monthly earnings
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="font-semibold text-emerald-600">{tier.commission}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Referrals needed</span>
                      <span className="font-medium">{tier.referrals}+</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="max-w-3xl mx-auto p-6 bg-background border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl flex-shrink-0">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Performance-Based Growth</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Start as an Explorer and advance through tiers by growing your referral network. 
                  Each tier unlocks higher commission rates, exclusive perks, and premium support. 
                  Your success directly translates to increased earnings.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="outline" className="px-4 py-1">
              <Zap className="h-3 w-3 mr-2" />
              Getting Started
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Simple Application Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Four straightforward steps to begin your ambassador journey
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {applicationSteps.map((step, index) => (
              <div key={index} className="relative group">
                <Card className="p-6 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-background">
                  <div className="space-y-4">
                    <div className="text-4xl font-bold text-muted-foreground/30 group-hover:text-primary/30 transition-colors">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </Card>
                {index < applicationSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-b from-muted/30 to-background border-t border-border/40">
        <div className="container mx-auto px-4">
          <Card className="p-10 lg:p-14 text-center max-w-3xl mx-auto bg-gradient-to-br from-primary/5 via-background to-accent/5 border-primary/20">
            <div className="space-y-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
                <Rocket className="h-8 w-8 text-primary" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-4xl font-bold">
                  Ready to Get Started?
                </h2>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Join our network of successful ambassadors and unlock your earning potential. 
                  Applications are reviewed within 24-48 hours.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Button size="lg" asChild className="text-base px-8 py-6 shadow-lg shadow-primary/20">
                  <Link to="/apply">
                    Apply Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
                  <a href="https://t.me/StarStore_app" target="_blank" rel="noopener noreferrer">
                    Contact Support
                  </a>
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  <span>Secure Platform</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Fast Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <span>Active Community</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Home;
