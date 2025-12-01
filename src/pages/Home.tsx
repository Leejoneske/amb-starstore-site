
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
    { tier: "Explorer", range: "$30+", referrals: "30", commission: "15%", icon: "🧭", color: "from-blue-500 to-cyan-500" },
    { tier: "Connector", range: "$60+", referrals: "50", commission: "18%", icon: "🤝", color: "from-purple-500 to-pink-500" },
    { tier: "Pioneer", range: "$80+", referrals: "70", commission: "20%", icon: "🚀", color: "from-orange-500 to-red-500" },
    { tier: "Elite", range: "$110+", referrals: "100", commission: "25%", icon: "🏆", color: "from-yellow-500 to-amber-500" }
  ];

  const testimonials = [
    {
      name: "Sarah M.",
      role: "Elite Ambassador",
      earnings: "$1,400/month",
      content: "StarStore's ambassador program changed everything for me. The exclusive access and community support is incredible.",
      avatar: "SM",
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      name: "Mike Chen",
      role: "Pioneer Ambassador", 
      earnings: "$800/month",
      content: "I love being part of the StarStore family. The rewards are great and the community is amazing.",
      avatar: "MC",
      color: "bg-gradient-to-br from-blue-500 to-cyan-500"
    },
    {
      name: "Emma R.",
      role: "Connector Ambassador",
      earnings: "$350/month", 
      content: "Even as a new ambassador, I felt welcomed and supported. The earning potential is real!",
      avatar: "ER",
      color: "bg-gradient-to-br from-green-500 to-emerald-500"
    }
  ];

  const applicationSteps = [
    {
      step: "1",
      title: "Apply",
      description: "Fill out our simple application form and tell us about your community",
      icon: <UserPlus className="h-6 w-6" />
    },
    {
      step: "2", 
      title: "Get Accepted",
      description: "Our team reviews your application and sends you exclusive access within 24 hours",
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    {
      step: "3",
      title: "Start Earning", 
      description: "Receive your unique referral links and start sharing with your community",
      icon: <DollarSign className="h-6 w-6" />
    },
    {
      step: "4",
      title: "Grow Together",
      description: "Join our exclusive community and unlock premium benefits as you grow",
      icon: <TrendingUp className="h-6 w-6" />
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

      {/* Earning Potential Section - IMPROVED */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="mb-2" variant="outline">
              <Sparkles className="h-3 w-3 mr-1" />
              Earning Potential
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Your Path to Success
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See what our ambassadors are earning monthly across different tiers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {earningRanges.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden group hover:scale-105 transition-all duration-300 ${
                  tier.tier === 'Elite' ? 'ring-2 ring-primary shadow-xl' : 'hover:shadow-lg'
                }`}
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${tier.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <div className="relative p-6 space-y-4">
                  {/* Tier Badge */}
                  <div className="flex items-center justify-between">
                    <Badge 
                      variant={tier.tier === 'Elite' ? 'default' : 'secondary'}
                      className={`text-sm font-semibold ${tier.tier === 'Elite' ? 'bg-gradient-to-r from-yellow-500 to-amber-500' : ''}`}
                    >
                      {tier.icon} {tier.tier}
                    </Badge>
                    {tier.tier === 'Elite' && (
                      <Crown className="h-5 w-5 text-yellow-500" />
                    )}
                  </div>

                  {/* Earnings */}
                  <div className="text-center py-4">
                    <div className="text-4xl font-bold bg-gradient-to-br ${tier.color} bg-clip-text text-transparent">
                      {tier.range}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">per month minimum</div>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Commission Rate</span>
                      <span className="font-bold text-green-600">{tier.commission}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Monthly Referrals</span>
                      <span className="font-bold">{tier.referrals}+</span>
                    </div>
                  </div>

                  {/* Hover Effect */}
                  <div className="pt-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    >
                      Aim for {tier.tier}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-purple-500/5 border-primary/20">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Unlock Higher Tiers</h3>
                <p className="text-sm text-muted-foreground">
                  Progress through tiers by increasing your monthly referrals. Each tier unlocks better commission rates, 
                  exclusive perks, and premium rewards. Start as an Explorer and work your way to Elite status!
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Application Process - IMPROVED */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative">
          <div className="text-center space-y-4 mb-16">
            <Badge className="mb-2" variant="outline">
              <Zap className="h-3 w-3 mr-1" />
              Quick & Easy
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold">Get Started in 4 Simple Steps</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our exclusive ambassador community in minutes
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {applicationSteps.map((step, index) => (
                <div key={index} className="relative group">
                  <Card className="p-6 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-primary/50">
                    <div className="space-y-4">
                      {/* Step Number with Icon */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-purple-600 text-white rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                          {step.step}
                        </div>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                          {step.icon}
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      {/* Progress Indicator */}
                      <div className="pt-2">
                        <div className="h-1 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-primary to-purple-600 transition-all duration-500"
                            style={{ width: `${((index + 1) / applicationSteps.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Connector Arrow */}
                  {index < applicationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-16 text-center">
            <Card className="inline-flex items-center gap-8 p-6 bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Average Time</div>
                  <div className="font-bold">5 minutes</div>
                </div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">Approval Rate</div>
                  <div className="font-bold">96%</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials - IMPROVED */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <Badge className="mb-2" variant="outline">
              <Star className="h-3 w-3 mr-1" />
              Success Stories
            </Badge>
            <h2 className="text-3xl lg:text-5xl font-bold">Loved by Ambassadors Worldwide</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real stories from our thriving community
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card 
                key={index} 
                className="p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
              >
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="relative space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 ${testimonial.color} rounded-full flex items-center justify-center shadow-lg`}>
                      <span className="font-bold text-white text-lg">{testimonial.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-lg">{testimonial.name}</h4>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {testimonial.role}
                      </Badge>
                    </div>
                  </div>

                  {/* Quote */}
                  <div className="relative">
                    <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
                    <p className="text-muted-foreground italic pl-6 leading-relaxed">
                      {testimonial.content}
                    </p>
                  </div>

                  {/* Earnings Badge */}
                  <div className="pt-4 border-t flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Monthly Earnings</span>
                    <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950 rounded-full">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-bold text-green-600">
                        {testimonial.earnings.replace('/month', '')}
                      </span>
                    </div>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex gap-1">
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

      {/* Trust Elements - IMPROVED */}
      <section className="py-16 border-y bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {trustElements.map((element, index) => (
              <div key={index} className="text-center space-y-3 group">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary to-purple-600 rounded-xl mb-2 group-hover:scale-110 transition-transform shadow-lg">
                  <div className="text-white">
                    {element.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                  {element.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {element.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - IMPROVED */}
      <section className="py-24 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10" />
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        
        <div className="container mx-auto px-4 relative">
          <Card className="max-w-4xl mx-auto p-12 text-center bg-background/95 backdrop-blur-sm border-2 shadow-2xl">
            <div className="space-y-8">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-purple-600 rounded-2xl shadow-xl">
                <Sparkles className="h-10 w-10 text-white" />
              </div>

              {/* Heading */}
              <div className="space-y-4">
                <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                  Ready to Start Your
                  <span className="block bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                    Ambassador Journey?
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Join an exclusive community of 500+ ambassadors earning premium rewards. 
                  Your path to success starts here.
                </p>
              </div>
              
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button 
                  size="lg" 
                  asChild 
                  className="text-lg px-10 py-7 bg-gradient-to-r from-primary to-purple-600 hover:shadow-xl transition-all hover:scale-105"
                >
                  <Link to="/apply">
                    <UserPlus className="mr-2 h-5 w-5" />
                    Become an Ambassador
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="text-lg px-10 py-7 hover:bg-muted transition-all"
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Ask Questions
                </Button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t max-w-2xl mx-auto">
                <div className="flex flex-col items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">Secure & Trusted</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">24h Approval</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="text-sm text-muted-foreground">500+ Members</span>
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
