
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
  Trophy,
  Shield,
  Zap,
  Target,
  Award,
  Globe,
  Heart,
  Clock,
  ChevronRight,
  Quote,
  PlayCircle,
  ExternalLink,
  Lock,
  Crown,
  Rocket,
  UserPlus
} from "lucide-react";
import { Link } from "react-router-dom";
import { TIER_INFO } from "@/lib/tier-utils";

const Home = () => {
  const coreBenefits = [
    {
      icon: <Lock className="h-8 w-8 text-blue-600" />,
      title: "Exclusive Access",
      description: "Private ambassador channels, early product access, and closed community events",
      features: ["Private Discord channels", "Early product launches", "Exclusive events"]
    },
    {
      icon: <Crown className="h-8 w-8 text-purple-600" />,
      title: "Premium Rewards",
      description: "Unique merchandise, special bonuses, and enhanced referral conditions",
      features: ["Custom ambassador merch", "Special bonuses", "Higher commission rates"]
    },
    {
      icon: <Rocket className="h-8 w-8 text-green-600" />,
      title: "Growth Program",
      description: "Share your expertise and grow with us through our enhanced ambassador program",
      features: ["Personal growth opportunities", "Skill development", "Community recognition"]
    }
  ];

  const earningRanges = [
    { tier: "Explorer", range: "$30+", referrals: "30", commission: "15%", icon: "🧭" },
    { tier: "Connector", range: "$60+", referrals: "50", commission: "18%", icon: "🤝" },
    { tier: "Pioneer", range: "$80+", referrals: "70", commission: "20%", icon: "🚀" },
    { tier: "Elite", range: "$110+", referrals: "100", commission: "25%", icon: "🏆" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Elite Ambassador",
      earnings: "$1,400/month",
      content: "StarStore's ambassador program changed everything for me. The exclusive access and community support is incredible.",
      avatar: "SM"
    },
    {
      name: "Mike Chen",
      role: "Pioneer Ambassador", 
      earnings: "$800/month",
      content: "I love being part of the StarStore family. The rewards are great and the community is amazing.",
      avatar: "MC"
    },
    {
      name: "Emma R.",
      role: "Connector Ambassador",
      earnings: "$350/month", 
      content: "Even as a new ambassador, I felt welcomed and supported. The earning potential is real!",
      avatar: "ER"
    }
  ];

  const applicationSteps = [
    {
      step: "1",
      title: "Apply",
      description: "Fill out our simple application form and tell us about your community"
    },
    {
      step: "2", 
      title: "Get Accepted",
      description: "Our team reviews your application and sends you exclusive access within 24 hours"
    },
    {
      step: "3",
      title: "Start Earning", 
      description: "Receive your unique referral links and start sharing with your community"
    },
    {
      step: "4",
      title: "Grow Together",
      description: "Join our exclusive community and unlock premium benefits as you grow"
    }
  ];

  const trustElements = [
    { label: "Active Ambassadors", value: "500+", icon: <Users className="h-5 w-5" /> },
    { label: "Total Rewards Paid", value: "$250K+", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Success Rate", value: "96%", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Countries", value: "25+", icon: <Globe className="h-5 w-5" /> }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 text-2xl font-bold">
                <img 
                  src="/favicon.ico" 
                  alt="StarStore" 
                  className="w-10 h-10"
                />
                StarStore
              </div>
              
              {/* Main Headline */}
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight font-serif">
                WELCOME TO STARSTORE
                <span className="block text-primary">AMBASSADOR PROGRAM</span>
              </h1>
              
              {/* Sub-headline */}
              <p className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Join StarStore Ambassador Program and unlock exclusive opportunities 
                in the world of e-commerce and community building.
              </p>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <Button size="lg" asChild className="text-lg px-8 py-6 bg-primary hover:bg-primary/90">
                <Link to="/apply">
                  Become an Ambassador
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Join 500+ successful ambassadors worldwide
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">What You'll Unlock</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Exclusive access, premium rewards, and growth opportunities await
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {coreBenefits.map((benefit, index) => (
              <Card key={index} className="p-8 text-center hover:shadow-lg transition-shadow">
                <div className="space-y-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full">
                    {benefit.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                    <p className="text-muted-foreground mb-4">{benefit.description}</p>
                    <ul className="space-y-2 text-sm">
                      {benefit.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Earning Potential</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our ambassadors are earning monthly
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {earningRanges.map((tier, index) => (
              <Card key={index} className={`p-6 ${tier.tier === 'Elite' ? 'ring-2 ring-primary' : ''}`}>
                <div className="space-y-4">
                  <Badge 
                    variant={tier.tier === 'Elite' ? 'default' : 'secondary'}
                    className="w-full justify-center text-sm py-1"
                  >
                    {tier.icon} {tier.tier}
                  </Badge>
                  
                  <div className="text-center py-3">
                    <div className="text-3xl font-bold text-primary">{tier.range}</div>
                    <div className="text-xs text-muted-foreground mt-1">minimum monthly</div>
                  </div>

                  <div className="space-y-2 text-sm pt-3 border-t">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission:</span>
                      <span className="font-semibold">{tier.commission}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Referrals:</span>
                      <span className="font-semibold">{tier.referrals}+</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How to Get Started</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Simple steps to join our exclusive ambassador community
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {applicationSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-6 h-full hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold">
                      {step.step}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm">{step.description}</p>
                    </div>
                  </div>
                </Card>
                {index < applicationSteps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">What Our Ambassadors Say</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from our community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-md transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="font-semibold text-primary">{testimonial.avatar}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        {testimonial.earnings}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    "{testimonial.content}"
                  </p>

                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Elements */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {trustElements.map((element, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-2">
                  <div className="text-primary">
                    {element.icon}
                  </div>
                </div>
                <div className="text-2xl font-bold">{element.value}</div>
                <div className="text-sm text-muted-foreground">{element.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center max-w-3xl mx-auto">
            <div className="space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Join Our Ambassador Program?
              </h2>
              <p className="text-xl text-muted-foreground">
                Unlock exclusive opportunities, premium rewards, and grow with our community. 
                Apply now and start your ambassador journey today.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/apply">
                    Become an Ambassador
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Ask Questions
                </Button>
              </div>

              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-6">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure & Trusted</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Quick Approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
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
