import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  DollarSign,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  MessageSquare,
  Gift,
  Trophy
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const tiers = [
    {
      level: 1,
      name: "Entry Level",
      icon: <Star className="h-6 w-6" />,
      color: "text-muted-foreground",
      borderColor: "border-border",
      bgColor: "bg-secondary/50",
      threshold: 30,
      commission: "6%",
      baseEarnings: 13,
      qualityBonus: 30,
      features: [
        "6% commission rate",
        "$13 base earnings",
        "$30 quality bonus",
        "Ambassador dashboard access",
        "Marketing materials"
      ],
      requirements: []
    },
    {
      level: 2,
      name: "Growing Ambassador",
      icon: <TrendingUp className="h-6 w-6" />,
      color: "text-primary",
      borderColor: "border-primary/30",
      bgColor: "bg-primary/5",
      threshold: 50,
      commission: "70%",
      baseEarnings: 35,
      qualityBonus: 25,
      features: [
        "70% commission rate",
        "$35 base earnings",
        "$25 quality bonus",
        "Priority support",
        "Featured on website"
      ],
      requirements: [
        "30+ successful transactions/month",
        "4 social media posts/month",
        "Active community participation"
      ]
    },
    {
      level: 3,
      name: "Advanced Ambassador",
      icon: <Sparkles className="h-6 w-6" />,
      color: "text-info",
      borderColor: "border-info/30",
      bgColor: "bg-info/5",
      threshold: 70,
      commission: "75%",
      baseEarnings: 52.5,
      qualityBonus: 28.5,
      features: [
        "75% commission rate (highest!)",
        "$52.50 base earnings",
        "$28.50 quality bonus",
        "Exclusive merchandise",
        "Co-marketing opportunities"
      ],
      requirements: [
        "50+ transactions/month",
        "6 social media posts/month",
        "Quality alignment maintained"
      ]
    },
    {
      level: 4,
      name: "Elite Ambassador",
      icon: <Trophy className="h-6 w-6" />,
      color: "text-warning",
      borderColor: "border-warning/30",
      bgColor: "bg-warning/5",
      threshold: 100,
      commission: "30%",
      baseEarnings: 30,
      qualityBonus: 30,
      features: [
        "30% commission rate",
        "$30 base earnings",
        "$30 quality bonus",
        "Direct team contact",
        "Annual bonus potential"
      ],
      requirements: [
        "70+ transactions/month",
        "8 social media posts/month",
        "Highest quality standards"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <Badge className="mb-6" variant="secondary">
              <Star className="h-3 w-3 mr-1" />
              4-Tier Progressive Program
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              StarStore Ambassador Program
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Earn up to 75% commission by promoting StarStore. Quality-focused rewards with progressive tiers and comprehensive support.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/apply">
                <Button size="lg" className="gap-2">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline">Ambassador Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">75%</div>
              <div className="text-sm text-muted-foreground">Max Commission</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">392</div>
              <div className="text-sm text-muted-foreground">Avg Stars/Transaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">250+</div>
              <div className="text-sm text-muted-foreground">Stars for Bonus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">4</div>
              <div className="text-sm text-muted-foreground">Progression Levels</div>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ambassador Tiers</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Progress through four levels based on performance. Each tier unlocks higher commissions, better bonuses, and exclusive benefits.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {tiers.map((tier, index) => (
            <Card 
              key={index} 
              className={`p-6 border-2 ${tier.borderColor} ${tier.bgColor} hover:shadow-lg transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="mb-6">
                <div className={`inline-flex p-3 rounded-lg bg-background border ${tier.borderColor} ${tier.color} mb-4`}>
                  {tier.icon}
                </div>
                <Badge variant="outline" className="mb-2">Level {tier.level}</Badge>
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-3xl font-bold ${tier.color}`}>{tier.commission}</span>
                  <span className="text-sm text-muted-foreground">commission</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {tier.threshold} referrals to unlock
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="p-3 rounded-lg bg-background border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Base Earnings</div>
                  <div className="font-semibold">${tier.baseEarnings}</div>
                </div>
                <div className="p-3 rounded-lg bg-background border border-border">
                  <div className="text-xs text-muted-foreground mb-1">Quality Bonus</div>
                  <div className="font-semibold">${tier.qualityBonus}</div>
                </div>
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <div className="text-xs font-semibold text-muted-foreground mb-3">FEATURES</div>
                <ul className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={`h-4 w-4 ${tier.color} mt-0.5 flex-shrink-0`} />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {tier.requirements.length > 0 && (
                <div className="border-t border-border pt-4">
                  <div className="text-xs font-semibold text-muted-foreground mb-3">REQUIREMENTS</div>
                  <ul className="space-y-2">
                    {tier.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <ArrowRight className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Quality Bonus System */}
      <section className="border-y border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <Star className="h-12 w-12 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">Star Quality System</h2>
              <p className="text-muted-foreground">
                Earn quality bonuses by maintaining high transaction standards
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center">
                <BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">392</div>
                <div className="text-sm text-muted-foreground">Average Stars per Transaction</div>
              </Card>
              <Card className="p-6 text-center">
                <Star className="h-8 w-8 text-warning mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">250+</div>
                <div className="text-sm text-muted-foreground">Stars Needed for Bonus</div>
              </Card>
              <Card className="p-6 text-center">
                <TrendingUp className="h-8 w-8 text-success mx-auto mb-3" />
                <div className="text-2xl font-bold mb-2">75%</div>
                <div className="text-sm text-muted-foreground">Sales Must Meet Standard</div>
              </Card>
            </div>

            <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <div className="font-semibold mb-1">Quality Bonus Eligibility</div>
                  <p className="text-sm text-muted-foreground">
                    To qualify for quality bonuses, 75% of your sales must exceed 250 stars. This ensures you're maintaining high customer satisfaction and transaction quality.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Program Benefits</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Comprehensive support and resources to help you succeed
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[
            { 
              icon: <DollarSign className="h-6 w-6" />, 
              title: "Monthly Payouts", 
              desc: "Reliable payments every month, on time" 
            },
            { 
              icon: <BarChart3 className="h-6 w-6" />, 
              title: "Real-time Analytics", 
              desc: "Track performance, earnings, and star ratings" 
            },
            { 
              icon: <Gift className="h-6 w-6" />, 
              title: "Quality Bonuses", 
              desc: "Extra rewards for maintaining high standards" 
            },
            { 
              icon: <MessageSquare className="h-6 w-6" />, 
              title: "Marketing Support", 
              desc: "Templates, resources, and promotional materials" 
            },
            { 
              icon: <Users className="h-6 w-6" />, 
              title: "Community Access", 
              desc: "Network with successful ambassadors" 
            },
            { 
              icon: <TrendingUp className="h-6 w-6" />, 
              title: "Tier Progression", 
              desc: "Unlock better rates as you grow" 
            }
          ].map((benefit, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="inline-flex p-3 rounded-lg bg-primary/10 text-primary mb-4">
                {benefit.icon}
              </div>
              <h3 className="font-semibold mb-2">{benefit.title}</h3>
              <p className="text-sm text-muted-foreground">{benefit.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 py-20">
          <Card className="p-12 text-center bg-gradient-to-br from-primary to-accent text-primary-foreground max-w-3xl mx-auto">
            <Sparkles className="h-12 w-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Earning?</h2>
            <p className="text-lg mb-8 opacity-90 max-w-xl mx-auto">
              Join our growing community of ambassadors and start earning commission today
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/apply">
                <Button size="lg" variant="secondary" className="gap-2">
                  Apply Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Sign In
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 StarStore Ambassador Program. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
