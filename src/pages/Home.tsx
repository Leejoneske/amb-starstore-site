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
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const tiers = [
    {
      level: 1,
      name: "Entry Level",
      icon: <Star className="h-8 w-8" />,
      color: "text-blue-600",
      borderColor: "border-blue-200",
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      threshold: 30,
      commission: "6%",
      baseEarnings: 13,
      qualityBonus: 30,
      features: [
        "6% commission rate",
        "$13 base earnings",
        "$30 quality bonus",
        "Ambassador dashboard access",
        "Marketing materials",
        "Basic support"
      ],
      requirements: ["Complete application", "Social media presence"],
      popular: false
    },
    {
      level: 2,
      name: "Growing Ambassador",
      icon: <TrendingUp className="h-8 w-8" />,
      color: "text-green-600",
      borderColor: "border-green-200",
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      threshold: 50,
      commission: "7%",
      baseEarnings: 35,
      qualityBonus: 50,
      features: [
        "7% commission rate",
        "$35 base earnings",
        "$50 quality bonus",
        "Priority support",
        "Advanced analytics",
        "Exclusive content",
        "Monthly webinars"
      ],
      requirements: ["30+ referrals", "4 social posts/month"],
      popular: true
    },
    {
      level: 3,
      name: "Advanced Ambassador",
      icon: <Trophy className="h-8 w-8" />,
      color: "text-purple-600",
      borderColor: "border-purple-200",
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      threshold: 100,
      commission: "8%",
      baseEarnings: 70,
      qualityBonus: 100,
      features: [
        "8% commission rate",
        "$70 base earnings",
        "$100 quality bonus",
        "VIP support",
        "Custom marketing tools",
        "Direct manager access",
        "Exclusive events"
      ],
      requirements: ["50+ referrals", "6 social posts/month"],
      popular: false
    },
    {
      level: 4,
      name: "Elite Ambassador",
      icon: <Award className="h-8 w-8" />,
      color: "text-yellow-600",
      borderColor: "border-yellow-200",
      bgColor: "bg-gradient-to-br from-yellow-50 to-yellow-100",
      threshold: 200,
      commission: "10%",
      baseEarnings: 140,
      qualityBonus: 200,
      features: [
        "10% commission rate",
        "$140 base earnings",
        "$200 quality bonus",
        "White-glove support",
        "Co-marketing opportunities",
        "Revenue sharing",
        "Ambassador advisory board"
      ],
      requirements: ["100+ referrals", "8 social posts/month"],
      popular: false
    }
  ];

  const stats = [
    { label: "Active Ambassadors", value: "2,500+", icon: <Users className="h-6 w-6" /> },
    { label: "Total Earnings Paid", value: "$1.2M+", icon: <DollarSign className="h-6 w-6" /> },
    { label: "Success Rate", value: "94%", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Countries", value: "45+", icon: <Globe className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Elite Ambassador",
      avatar: "SJ",
      content: "StarStore's ambassador program changed my life. I've earned over $15,000 in just 6 months while helping others discover amazing products.",
      earnings: "$15,000+",
      tier: "Elite"
    },
    {
      name: "Mike Chen",
      role: "Advanced Ambassador",
      avatar: "MC",
      content: "The support team is incredible and the commission structure is very fair. I love being part of this community!",
      earnings: "$8,500+",
      tier: "Advanced"
    },
    {
      name: "Emily Rodriguez",
      role: "Growing Ambassador",
      avatar: "ER",
      content: "Even as a new ambassador, I was able to start earning within my first month. The training materials are excellent.",
      earnings: "$3,200+",
      tier: "Growing"
    }
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8 text-blue-600" />,
      title: "Secure & Reliable",
      description: "Your earnings are protected with industry-leading security and guaranteed monthly payouts."
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: "Quick Setup",
      description: "Get started in minutes with our streamlined onboarding process and instant access to materials."
    },
    {
      icon: <Target className="h-8 w-8 text-green-600" />,
      title: "Proven Results",
      description: "Join thousands of successful ambassadors who have built sustainable income streams."
    },
    {
      icon: <Heart className="h-8 w-8 text-red-600" />,
      title: "Community Support",
      description: "Connect with fellow ambassadors, share strategies, and grow together in our exclusive community."
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Apply",
      description: "Submit your application and tell us about your social media presence and marketing experience.",
      icon: <MessageSquare className="h-6 w-6" />
    },
    {
      number: "02",
      title: "Get Approved",
      description: "Our team reviews your application and sends you login credentials via email within 24 hours.",
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    {
      number: "03",
      title: "Start Earning",
      description: "Access your dashboard, get your referral links, and start sharing to earn commissions immediately.",
      icon: <DollarSign className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Join 2,500+ Successful Ambassadors
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Turn Your
                  <span className="text-primary block">Influence Into</span>
                  <span className="text-accent block">Income</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Join StarStore's Ambassador Program and earn up to 10% commission 
                  by sharing products you love. Start earning today!
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/apply">
                    Start Earning Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  No upfront costs
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Instant payouts
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Global program
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative z-10">
                <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Trophy className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-2xl font-bold">Elite Ambassador</h3>
                      <p className="text-muted-foreground">Sarah Johnson</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">$15,000+</div>
                        <div className="text-sm text-muted-foreground">Total Earnings</div>
                      </div>
                      <div className="text-center p-4 bg-background/50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">10%</div>
                        <div className="text-sm text-muted-foreground">Commission Rate</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>This Month</span>
                        <span className="font-semibold">$2,340</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-primary">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Get started in just 3 simple steps and begin earning immediately
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="p-8 text-center h-full">
                  <div className="space-y-4">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full">
                      {step.icon}
                    </div>
                    <div className="text-4xl font-bold text-primary/20">{step.number}</div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </Card>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <ChevronRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose StarStore?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We provide everything you need to succeed as an ambassador
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-background rounded-full">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Tier System Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Ambassador Tiers</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Earn more as you grow. Higher tiers unlock better commissions and exclusive benefits.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative p-6 h-full ${tier.bgColor} ${tier.borderColor} border-2 hover:shadow-xl transition-all duration-300 ${
                  tier.popular ? 'ring-2 ring-primary ring-offset-2 scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${tier.bgColor}`}>
                      <div className={tier.color}>
                        {tier.icon}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <div className="text-3xl font-bold text-primary mt-2">{tier.commission}</div>
                    <div className="text-sm text-muted-foreground">Commission Rate</div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm">Base Earnings</span>
                      <span className="font-semibold">${tier.baseEarnings}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm">Quality Bonus</span>
                      <span className="font-semibold">${tier.qualityBonus}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg">
                      <span className="text-sm">Min Referrals</span>
                      <span className="font-semibold">{tier.threshold}+</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Features:</h4>
                    <ul className="space-y-1">
                      {tier.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`w-full ${tier.popular ? 'bg-primary hover:bg-primary/90' : 'bg-muted hover:bg-muted/80'}`}
                    variant={tier.popular ? 'default' : 'secondary'}
                  >
                    {tier.level === 1 ? 'Get Started' : 'Upgrade Now'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Success Stories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from our top-performing ambassadors
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="font-semibold text-primary">{testimonial.avatar}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">{testimonial.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {testimonial.tier} Ambassador
                        </Badge>
                        <span className="text-sm text-green-600 font-semibold">
                          {testimonial.earnings}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <Quote className="h-6 w-6 text-muted-foreground/50 absolute -top-2 -left-2" />
                    <p className="text-muted-foreground italic pl-4">
                      "{testimonial.content}"
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-primary/20">
            <div className="space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl lg:text-4xl font-bold">
                Ready to Start Your Ambassador Journey?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of successful ambassadors and start earning today. 
                No experience required - we'll guide you every step of the way.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" asChild className="text-lg px-8 py-6">
                  <Link to="/apply">
                    Apply Now - It's Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Learn More
                </Button>
              </div>

              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground pt-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Quick approval</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Secure payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Community support</span>
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