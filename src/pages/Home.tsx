import Navbar from "@/components/Navbar";
import NewsletterSignup from "@/components/NewsletterSignup";
import ScrollReveal from "@/components/ScrollReveal";
import {
  Rocket,
  Users,
  TrendingUp,
  Gift,
  Star,
  Shield,
  BookOpen,
  MessageCircle,
  Mail,
  ChevronRight,
  Award,
  Handshake,
  Gem,
  Crown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/* ─────── HERO ─────── */
const HeroSection = () => (
  <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-4 sm:px-6 lg:px-8 overflow-hidden">
    {/* Subtle background accent */}
    <div
      className="absolute inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(var(--primary) / 0.06), transparent)",
      }}
    />
    <div className="max-w-4xl mx-auto text-center">
      <ScrollReveal>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary bg-primary/8 px-3 py-1 rounded-full mb-6">
          <Star className="w-3.5 h-3.5" /> Official Guide
        </span>
      </ScrollReveal>
      <ScrollReveal delay={80}>
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-6"
          style={{
            fontFamily: "'Libre Baskerville', serif",
            lineHeight: 1.08,
            letterSpacing: "-0.02em",
          }}
        >
          StarStore Ambassador Program
        </h1>
      </ScrollReveal>
      <ScrollReveal delay={160}>
        <p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          style={{ textWrap: "pretty" }}
        >
          Everything you need to know — from getting started and earning commissions, to understanding
          our policies and managing your membership. This is your complete reference.
        </p>
      </ScrollReveal>
      <ScrollReveal delay={240}>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary" /> 500+ Active Ambassadors</span>
          <span className="flex items-center gap-1.5"><TrendingUp className="w-4 h-4 text-primary" /> $50K+ Paid Out</span>
          <span className="flex items-center gap-1.5"><Gift className="w-4 h-4 text-primary" /> Up to 20% Commission</span>
        </div>
      </ScrollReveal>
    </div>
  </section>
);

/* ─────── TABLE OF CONTENTS ─────── */
const tocItems = [
  { icon: BookOpen, label: "Program Overview", href: "#overview" },
  { icon: Rocket, label: "How It Works", href: "#how-it-works" },
  { icon: Award, label: "Ambassador Levels", href: "#levels" },
  { icon: Shield, label: "Program Policies", href: "#policies" },
  { icon: XCircle, label: "Opt-Out & Opt-In", href: "#opt-out" },
  { icon: HelpCircle, label: "Frequently Asked Questions", href: "#faq" },
  { icon: Mail, label: "Newsletter", href: "#newsletter" },
];

const TableOfContents = () => (
  <section className="py-12 px-4 sm:px-6 lg:px-8">
    <ScrollReveal>
      <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 shadow-sm">
        <h2
          className="text-lg font-bold text-foreground mb-4"
          style={{ fontFamily: "'Libre Baskerville', serif" }}
        >
          Table of Contents
        </h2>
        <nav className="grid sm:grid-cols-2 gap-2">
          {tocItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(item.href)?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors group"
            >
              <item.icon className="w-4 h-4 text-primary shrink-0" />
              <span>{item.label}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </a>
          ))}
        </nav>
      </div>
    </ScrollReveal>
  </section>
);

/* ─────── SECTION WRAPPER ─────── */
const Section = ({
  id,
  title,
  icon: Icon,
  children,
  accent = false,
}: {
  id: string;
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: boolean;
}) => (
  <section
    id={id}
    className={`py-20 md:py-24 px-4 sm:px-6 lg:px-8 ${accent ? "bg-secondary/30" : ""}`}
  >
    <div className="max-w-3xl mx-auto">
      <ScrollReveal>
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
            <Icon className="w-5 h-5 text-primary" />
          </div>
          <h2
            className="text-2xl md:text-3xl font-bold text-foreground"
            style={{ fontFamily: "'Libre Baskerville', serif", lineHeight: 1.15 }}
          >
            {title}
          </h2>
        </div>
      </ScrollReveal>
      {children}
    </div>
  </section>
);

/* ─────── PROSE BLOCK ─────── */
const Prose = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <ScrollReveal delay={delay}>
    <div className="prose-content text-muted-foreground leading-relaxed space-y-4 [&_strong]:text-foreground [&_strong]:font-semibold overflow-wrap-break-word">
      {children}
    </div>
  </ScrollReveal>
);

/* ─────── LEVEL CARD ─────── */
const LevelCard = ({
  name,
  referrals,
  icon: Icon,
  gradient,
  requirements,
  benefits,
  delay,
}: {
  name: string;
  referrals: string;
  icon: React.ElementType;
  gradient: string;
  requirements: string[];
  benefits: string[];
  delay: number;
}) => (
  <ScrollReveal delay={delay}>
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className={`${gradient} px-6 py-4 text-white`}>
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6" />
          <div>
            <h3 className="text-lg font-bold">{name}</h3>
            <p className="text-sm opacity-90">{referrals}</p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Requirements</h4>
          <ul className="space-y-1.5">
            {requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <ChevronRight className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="border-t border-border pt-4">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Benefits</h4>
          <ul className="space-y-1.5">
            {benefits.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 text-primary shrink-0" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </ScrollReveal>
);

/* ─────── MAIN PAGE ─────── */
const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <HeroSection />
      <TableOfContents />

      {/* ────── OVERVIEW ────── */}
      <Section id="overview" title="Program Overview" icon={BookOpen}>
        <Prose>
          <p>
            The <strong>StarStore Ambassador Program</strong> is an invite-and-apply initiative designed for content creators,
            community leaders, social media enthusiasts, and everyday users who are passionate about the Telegram Stars ecosystem.
            Launched in <strong>early 2025</strong>, the program empowers individuals around the world to earn real income by
            promoting StarStore products and services through their unique referral links.
          </p>
          <p>
            At its core, the program is built on a simple principle: <strong>when you bring value, you get rewarded.</strong> Every
            successful referral you generate earns you a commission. The more active and impactful you are, the higher your
            ambassador level — unlocking better commission rates, exclusive perks, free Telegram Stars, priority support, and even
            revenue-sharing opportunities.
          </p>
          <p>
            StarStore is a platform where users buy, sell, and trade Telegram Stars — a digital currency used across Telegram's
            ecosystem for tipping creators, unlocking premium content, boosting channels, and more. As an ambassador, you become a
            bridge between StarStore and new users, helping grow the ecosystem while earning for your efforts.
          </p>
          <p>
            The program is <strong>completely free to join</strong>. There are no upfront costs, no hidden fees, and no inventory to
            manage. All you need is an internet connection, at least one social media platform, and the drive to share something you
            believe in. Whether you have 100 followers or 100,000, there's a place for you.
          </p>
        </Prose>

        <ScrollReveal delay={60}>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, label: "Earn Commission", desc: "Competitive rates on every sale through your link" },
              { icon: Gift, label: "Exclusive Perks", desc: "Early access, free Stars, ambassador-only discounts" },
              { icon: Rocket, label: "Growth Support", desc: "Marketing materials, training, and dedicated support" },
            ].map((card) => (
              <div key={card.label} className="bg-card border border-border rounded-xl p-5 text-center shadow-sm">
                <card.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <h3 className="text-sm font-semibold text-foreground mb-1">{card.label}</h3>
                <p className="text-xs text-muted-foreground">{card.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <Prose delay={120}>
          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Who Can Join?
          </h3>
          <p>
            Anyone aged 18 or older with an active social media presence or community can apply. We welcome creators on
            <strong> Instagram, TikTok, YouTube, X (Twitter), Facebook, Telegram channels</strong>, and other platforms.
            You don't need to be a professional influencer — we value authenticity and genuine engagement over raw follower
            counts. Micro-creators with small but dedicated audiences are especially encouraged.
          </p>
          <p>
            Applications are reviewed manually by the StarStore team. We look at the quality of your content, the relevance
            of your audience, your engagement rate, and your willingness to represent the StarStore brand with integrity.
            Approved ambassadors receive a welcome email, a unique referral code, access to the ambassador dashboard, and
            onboarding materials to get started immediately.
          </p>
        </Prose>
      </Section>

      {/* ────── HOW IT WORKS ────── */}
      <Section id="how-it-works" title="How It Works" icon={Rocket} accent>
        <Prose>
          <p>
            Getting started as a StarStore Ambassador is straightforward. Here's a step-by-step walkthrough of the entire
            process, from application to your first payout.
          </p>
        </Prose>

        <ScrollReveal delay={60}>
          <div className="mt-8 space-y-6">
            {[
              {
                step: "01",
                title: "Apply Through the Official Channel",
                desc: `Visit the StarStore ambassador page at starstore.site/ambassador or open the Telegram bot on Telegram. Fill out the application form with your email address and the social media platforms where you plan to promote. Your application will be reviewed within 1–3 business days.`,
              },
              {
                step: "02",
                title: "Get Approved & Onboarded",
                desc: `Once approved, you'll receive a confirmation email with your unique referral code and a link to the ambassador dashboard. The dashboard is your command center — it shows your referrals, earnings, level progress, payout history, and marketing resources. Take time to explore it and read the onboarding guide.`,
              },
              {
                step: "03",
                title: "Share Your Referral Link",
                desc: `Start sharing your unique referral link on your social platforms, within Telegram groups, in blog posts, YouTube video descriptions, or anywhere your audience interacts with you. When someone clicks your link and makes a purchase on StarStore, the sale is automatically tracked and attributed to you.`,
              },
              {
                step: "04",
                title: "Earn & Level Up",
                desc: `Every qualifying transaction earns you a commission, credited to your ambassador account balance. As you accumulate more successful referrals and meet the activity requirements, you progress through the four ambassador levels — Explorer, Connector, Pioneer, and Elite — each with progressively better rewards.`,
              },
              {
                step: "05",
                title: "Receive Your Monthly Payout",
                desc: `Payouts are made automatically on the 1st of each month. Your earnings are sent directly to your configured USDT (TON network) wallet address — completely free of charge. Alternative payout methods are available but processing fees will be deducted from your earnings, so we strongly recommend USDT on TON. There is no minimum withdrawal — even if your balance is as low as 0.5 USDT, it will be paid out.`,
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        <Prose delay={120}>
          <h3 className="text-lg font-bold text-foreground mt-12" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Tracking & Attribution
          </h3>
          <p>
            All referrals are tracked through our automated system. When a new user clicks your unique link, a cookie is set
            that lasts for <strong>30 days</strong>. This means even if the user doesn't purchase immediately, you'll still
            receive credit for the sale as long as it happens within that 30-day window. The dashboard updates in near
            real-time so you can monitor your performance as it happens.
          </p>
          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Content Expectations
          </h3>
          <p>
            As an ambassador, you're expected to create authentic, honest content about StarStore. This means no misleading
            claims, no spam, and no fake testimonials. You should always disclose your affiliate relationship where required
            by law (e.g., FTC guidelines in the US). StarStore provides ready-to-use social media assets, banners, and
            templates through the ambassador dashboard — feel free to customize them to match your personal brand.
          </p>
          <p>
            Each level has a minimum content requirement (detailed below). This isn't about quantity for the sake of it —
            it's about maintaining an active, visible presence that drives genuine engagement. Quality always trumps quantity.
          </p>
        </Prose>
      </Section>

      {/* ────── LEVELS ────── */}
      <Section id="levels" title="Ambassador Levels" icon={Award}>
        <Prose>
          <p>
            The Ambassador Program features <strong>four progression levels</strong>, each designed to reward increasingly
            active and impactful ambassadors. Your level is evaluated monthly based on your referral count, transaction
            volume, content output, and community involvement. Leveling up is automatic once you meet the criteria — no
            application needed.
          </p>
        </Prose>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <LevelCard
            name="Explorer"
            referrals="30+ referrals/month"
            icon={Star}
            gradient="level-explorer"
            delay={0}
            requirements={[
              "30+ successful transactions per month",
              "4 social media posts per month",
              "Active participation in the community",
              "Average transaction value of 350+ Stars",
            ]}
            benefits={[
              "$30 minimum monthly earnings",
              "Priority recognition badge",
              "50 free Telegram Stars monthly",
              "Access to the ambassador group",
              "Basic analytics dashboard",
            ]}
          />
          <LevelCard
            name="Connector"
            referrals="50+ referrals/month"
            icon={Handshake}
            gradient="level-connector"
            delay={80}
            requirements={[
              "50+ successful transactions per month",
              "6 social media posts per month",
              "Average transaction value of 400+ Stars",
              "Consistent month-over-month growth",
            ]}
            benefits={[
              "$60+ monthly earnings",
              "VIP member status",
              "100 free Telegram Stars monthly",
              "Advanced analytics and reporting",
              "Priority customer support",
            ]}
          />
          <LevelCard
            name="Pioneer"
            referrals="70+ referrals/month"
            icon={Gem}
            gradient="level-pioneer"
            delay={160}
            requirements={[
              "70+ successful transactions per month",
              "8 social media posts (including 1 video)",
              "Average transaction value of 450+ Stars",
              "Mentor at least 1 Explorer-level ambassador",
            ]}
            benefits={[
              "$80+ monthly earnings",
              "Achievement recognition & badge",
              "150 free Telegram Stars monthly",
              "Priority support queue",
              "Co-marketing opportunities with StarStore",
            ]}
          />
          <LevelCard
            name="Elite"
            referrals="100+ referrals/month"
            icon={Crown}
            gradient="level-elite"
            delay={240}
            requirements={[
              "100+ successful transactions per month",
              "10 social media posts (including 2 videos)",
              "Average transaction value of 500+ Stars",
              "Lead at least 1 monthly community event",
            ]}
            benefits={[
              "$110+ monthly earnings",
              "Elite status and exclusive badge",
              "200 free Telegram Stars monthly",
              "Revenue share participation",
              "Direct access to the StarStore team",
            ]}
          />
        </div>

        <Prose delay={60}>
          <h3 className="text-lg font-bold text-foreground mt-12" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Level Evaluation & Demotion
          </h3>
          <p>
            Levels are evaluated at the <strong>end of each calendar month</strong>. If you meet the criteria for a higher
            level, you're automatically promoted at the start of the next month. If you fall below the requirements for your
            current level for <strong>two consecutive months</strong>, you may be demoted to the level that matches your
            activity. This ensures the program remains fair and that active ambassadors are properly rewarded.
          </p>
          <p>
            Don't worry about occasional dips — everyone has slow months. The two-month buffer gives you time to recover.
            If you anticipate a period of reduced activity (vacation, exams, personal matters), you can request a
            <strong> level freeze</strong> through support for up to 30 days. This pauses your evaluation without affecting
            your current level.
          </p>
        </Prose>
      </Section>

      {/* ────── POLICIES ────── */}
      <Section id="policies" title="Program Policies" icon={Shield} accent>
        <Prose>
          <p>
            The StarStore Ambassador Program is governed by a set of policies designed to protect both our ambassadors and
            our users. By participating in the program, you agree to abide by these terms. Violations may result in warnings,
            level demotion, earnings forfeiture, or permanent removal from the program.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Code of Conduct
          </h3>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Be honest.</strong> Never make exaggerated or false claims about StarStore, its products, earnings potential, or services.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Disclose your affiliation.</strong> Where required by law or platform rules, clearly state that you are a StarStore ambassador and may earn commission from referrals.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Respect your audience.</strong> No spamming, no unsolicited messages, and no misleading clickbait. Build trust through genuine recommendations.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>No self-referrals.</strong> Creating fake accounts or referring yourself to inflate your numbers is strictly prohibited and will result in immediate termination.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Respect intellectual property.</strong> Only use StarStore's official logos, images, and marketing materials. Do not create content that could be mistaken for official StarStore communications.</span></li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Earnings & Commission Policy
          </h3>
          <p>
            Commissions are calculated on <strong>qualifying transactions only</strong> — purchases that are completed, not
            refunded, and made by legitimate users referred through your link. Commissions are credited to your ambassador
            account within 24–48 hours of a qualifying transaction. The commission rate depends on your current level and may
            range from 10% to 20% of the transaction value.
          </p>
          <p>
            StarStore reserves the right to adjust commission rates with 30 days' written notice. Any pending earnings at the
            time of a rate change will be honored at the original rate. Fraudulent or manipulated transactions (including but
            not limited to self-referrals, bot traffic, or coordinated abuse) will result in commission clawback and possible
            account termination.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Withdrawal & Payout Policy
          </h3>
          <p>
            Payouts are made <strong>automatically on the 1st of each month</strong>. There is <strong>no minimum withdrawal amount</strong> — even if your balance is as low as <strong>0.5 USDT</strong>, you will still receive your payout. Ambassadors do not need to manually request withdrawals; the system processes all payouts automatically based on your configured payout address.
          </p>
          <p>
            The <strong>recommended and default payout method</strong> is <strong>USDT on the TON network</strong>, which is <strong>completely free</strong> — no fees, no deductions. Ambassadors set their USDT TON wallet address in their dashboard, and payouts are sent directly to it each month.
          </p>
          <p>
            Alternative payout methods may be available (e.g., other crypto networks or third-party wallets), but <strong>processing fees will be deducted from your earnings</strong> if you choose an alternative method. We strongly recommend using USDT on TON to maximize your take-home pay.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Account Activity & Inactivity
          </h3>
          <p>
            Ambassadors are expected to maintain regular activity. An account is considered <strong>inactive</strong> if there
            are no referrals, no content posted, and no dashboard logins for <strong>60 consecutive days</strong>. Inactive
            accounts will receive a warning email. If no activity resumes within 30 days of the warning, the account may be
            suspended. Suspended accounts retain their earned balance for 90 days, after which unclaimed funds may be
            forfeited.
          </p>
          <p>
            To reactivate a suspended account, contact support at <strong>support@starstore.site</strong>. Reactivation is at
            StarStore's discretion and may require starting at the Explorer level regardless of your previous tier.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Termination by StarStore
          </h3>
          <p>
            StarStore reserves the right to terminate any ambassador's participation at any time for any of the following reasons:
          </p>
          <ul className="space-y-1 list-disc pl-5">
            <li>Violation of the Code of Conduct</li>
            <li>Fraudulent activity or manipulation of the referral system</li>
            <li>Engagement in illegal activities using the StarStore platform</li>
            <li>Bringing the StarStore brand into disrepute</li>
            <li>Repeated failure to meet minimum level requirements without valid justification</li>
          </ul>
          <p>
            In cases of termination for cause, pending earnings may be forfeited. Ambassadors terminated without cause will
            receive all outstanding earnings within 30 days.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Privacy & Data
          </h3>
          <p>
            StarStore collects and processes ambassador data (name, email, social profiles, referral statistics, payout
            information) in accordance with our Privacy Policy. Your data is never sold to third parties. Referral tracking
            data is used solely for the purpose of calculating commissions and evaluating level status. You can request a
            complete data export or deletion at any time by contacting <strong>support@starstore.site</strong>.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Modifications to the Program
          </h3>
          <p>
            StarStore may modify these policies, commission rates, level requirements, or any aspect of the Ambassador Program
            at any time. Material changes will be communicated via email at least <strong>14 days before</strong> taking effect.
            Continued participation after the effective date constitutes acceptance of the updated terms. If you disagree with
            any changes, you may opt out of the program as described below.
          </p>
        </Prose>
      </Section>

      {/* ────── OPT-OUT ────── */}
      <Section id="opt-out" title="Opt-Out & Opt-In Guide" icon={XCircle}>
        <Prose>
          <p>
            We believe participation should always be voluntary. If you decide the Ambassador Program is no longer right for you,
            we've made the opt-out process clear and accessible. Likewise, if you change your mind after opting out, there's a
            path back. Here's everything you need to know.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-8" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            How to Opt Out
          </h3>
          <p>
            There are <strong>two official methods</strong> to opt out of the StarStore Ambassador Program:
          </p>
        </Prose>

        <ScrollReveal delay={60}>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Method 1: Email</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Send an email to <strong>support@starstore.site</strong> with the subject line
                <strong> "Ambassador Opt-Out Request"</strong>. Include your registered email address and your ambassador
                referral code. Our team will process your request within <strong>3–5 business days</strong> and send you a
                confirmation email once completed.
              </p>
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">Method 2: Telegram Bot</h4>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                Open the StarStore bot on Telegram. Type the command
                <strong> /opt_out</strong> and follow the on-screen prompts. You'll be asked to confirm your decision.
                Bot-initiated opt-outs are processed <strong>automatically and immediately</strong>.
              </p>
              <a
                href="https://t.me/TgStarStore_bot"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Open Telegram Bot
              </a>
            </div>
          </div>
        </ScrollReveal>

        <Prose delay={120}>
          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            What Happens When You Opt Out
          </h3>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span>Your referral link is <strong>deactivated immediately</strong>. No new referrals will be tracked or credited.</span></li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span>Your ambassador dashboard access is revoked within 24 hours.</span></li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span>Any <strong>pending earnings</strong> in your account will be processed and paid out to your preferred method within <strong>14 business days</strong>, provided they meet the minimum withdrawal threshold. If below threshold, you can request a manual payout.</span></li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span>Your ambassador level is <strong>reset</strong>. If you opt back in later, you'll start from Explorer unless otherwise approved.</span></li>
            <li className="flex items-start gap-2"><ArrowRight className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span>Your personal data will be retained for <strong>90 days</strong> for accounting and compliance purposes, after which it will be deleted unless otherwise required by law.</span></li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            When We Allow Opt-Out
          </h3>
          <p>
            Opt-out requests are honored <strong>at any time, for any reason</strong>. You do not need to justify your decision.
            However, there are specific situations where opt-out processing may be temporarily delayed:
          </p>
          <ul className="space-y-1 list-disc pl-5">
            <li><strong>Pending investigation:</strong> If your account is currently under review for potential policy violations, the opt-out will be held until the investigation concludes. This is to prevent abuse of the opt-out process to evade consequences.</li>
            <li><strong>Outstanding balance disputes:</strong> If there's a dispute about your earnings (e.g., suspected fraudulent referrals being reviewed), the opt-out will be processed but payout may be delayed until the dispute is resolved.</li>
            <li><strong>Contractual obligations:</strong> If you've entered into a specific campaign or promotional agreement with StarStore that has a minimum term, early opt-out may be subject to the terms of that agreement.</li>
          </ul>
          <p>
            In all other cases, your opt-out is processed without conditions.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            When We Don't Allow Immediate Opt-Out
          </h3>
          <p>
            While we will <strong>never prevent you from leaving</strong> the program entirely, immediate processing may be
            deferred in the following edge cases:
          </p>
          <ul className="space-y-1 list-disc pl-5">
            <li><strong>Active fraud investigation:</strong> Your account may be frozen during an active investigation. Opt-out will be queued and completed once the investigation concludes.</li>
            <li><strong>In the middle of a payout cycle:</strong> If you request opt-out during an active payout processing window, the current payout will complete first, then the opt-out will be finalized.</li>
          </ul>
          <p>
            Rest assured: even in these cases, your opt-out request is <strong>logged and timestamped</strong>, and we aim to
            resolve all pending matters within 14 business days.
          </p>

          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            How to Opt Back In
          </h3>
          <p>
            Changed your mind? We'd love to have you back. Here's how the opt-in process works after you've previously opted out:
          </p>
          <ul className="space-y-2 list-none pl-0">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Within 30 days of opt-out:</strong> You can request reinstatement by emailing support@starstore.site. Your previous data and referral history may be restored, and you may resume at your previous level if your historical metrics support it. A brief review is required.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>After 30 days:</strong> You'll need to <strong>reapply</strong> through the standard application process. Your previous history is not carried over, and you'll start fresh as an Explorer. This ensures fairness for all ambassadors.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-primary shrink-0" /> <span><strong>Previously terminated for cause:</strong> If you were removed due to a policy violation, reinstatement is at StarStore's <strong>sole discretion</strong>. You may be required to complete an appeal process and agree to additional monitoring for a probationary period.</span></li>
          </ul>

          <h3 className="text-lg font-bold text-foreground mt-10" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            Cooling-Off Period
          </h3>
          <p>
            After submitting an opt-out request via email, there is a <strong>48-hour cooling-off period</strong> during which
            you can cancel the request by replying to the confirmation email with "CANCEL OPT-OUT." After 48 hours, the opt-out
            becomes permanent and your account will be deactivated. Telegram bot opt-outs are <strong>immediate and do not have
            a cooling-off period</strong> — make sure you're certain before confirming in the bot.
          </p>
        </Prose>

        <ScrollReveal delay={60}>
          <div className="mt-8 bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-1">Important Note</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Opting out of the Ambassador Program does <strong>not</strong> delete your StarStore user account. You can
                  continue using StarStore as a regular customer. If you also wish to delete your StarStore account entirely,
                  that is a separate request handled through our main support channel.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </Section>

      {/* ────── FAQ ────── */}
      <Section id="faq" title="Frequently Asked Questions" icon={HelpCircle} accent>
        <ScrollReveal>
          <Accordion type="single" collapsible className="w-full">
            {[
              {
                q: "How long does it take to get approved?",
                a: "Most applications are reviewed within 1–3 business days. During high-volume periods, it may take up to 5 business days. You'll receive an email notification regardless of the outcome.",
              },
              {
                q: "Can I be an ambassador if I don't have a large following?",
                a: "Absolutely. We value quality over quantity. Even if you have a small but engaged audience, you can be a successful ambassador. Many of our top performers started with fewer than 500 followers.",
              },
              {
                q: "What happens if I don't meet my level requirements one month?",
                a: "Missing requirements for a single month won't cause a demotion. You have a two-month buffer. If you fall short for two consecutive months, you may be moved to the level that matches your activity. You can also request a level freeze for up to 30 days if you need a break.",
              },
              {
                q: "How are commissions calculated?",
                a: "Commissions are a percentage of each qualifying transaction made by users you referred. The exact rate depends on your ambassador level (ranging from approximately 10% to 20%). Only completed, non-refunded transactions by legitimate users count.",
              },
              {
                q: "Can I promote StarStore in any language?",
                a: "Yes! StarStore has a global audience, and we welcome content in any language. However, your content must still comply with our Code of Conduct and all applicable local laws and regulations.",
              },
              {
                q: "What payout methods are available?",
                a: "The recommended payout method is USDT on the TON network, which is completely free. Alternative methods may be available but will have processing fees deducted from your earnings. We strongly recommend USDT on TON to keep 100% of your pay.",
              },
              {
                q: "Can I rejoin the program after opting out?",
                a: "Yes. Within 30 days of opt-out, you can request reinstatement via email and may retain your previous level. After 30 days, you'll need to reapply fresh. Those terminated for cause must go through an appeal process.",
              },
              {
                q: "Is there a limit to how much I can earn?",
                a: "There is no earning cap. The more referrals you generate, the more you earn. Elite-level ambassadors also participate in revenue sharing, which further increases earning potential.",
              },
              {
                q: "Do I need to pay taxes on my ambassador earnings?",
                a: "Ambassador earnings may be subject to taxation depending on your country's laws. StarStore does not withhold taxes on your behalf. We recommend consulting a tax professional for guidance specific to your situation.",
              },
              {
                q: "How do I contact support?",
                a: "You can reach our support team at support@starstore.site or through the Telegram bot. You can also join our Telegram community at t.me/StarStore_app for updates and peer support. Ambassadors at Pioneer level and above have access to priority support with faster response times.",
              },
            ].map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border">
                <AccordionTrigger className="text-sm text-foreground hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollReveal>
      </Section>

      {/* ────── NEWSLETTER ────── */}
      <NewsletterSignup />

      {/* ────── FOOTER ────── */}
      <footer className="border-t border-border py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Libre Baskerville', serif" }}>
            StarStore Ambassador Program
          </p>
          <p className="text-xs text-muted-foreground max-w-lg mx-auto">
            © {new Date().getFullYear()} StarStore. All rights reserved. This guide is for informational purposes.
            Program terms may change — always refer to the latest version at this page or contact support for clarification.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            <a href="https://starstore.site" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              starstore.site
            </a>
            <span>·</span>
            <a href="mailto:support@starstore.site" className="hover:text-foreground transition-colors">
              support@starstore.site
            </a>
            <span>·</span>
            <a href="https://t.me/TgStarStore_bot" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Telegram Bot
            </a>
            <span>·</span>
            <a href="https://t.me/StarStore_app" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
              Community
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
