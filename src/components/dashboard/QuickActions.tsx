import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAmbassadorProfile } from '@/hooks/useAmbassadorProfile';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';
import {
  Share2,
  MessageSquare,
  Gift,
  Users,
  TrendingUp,
  FileText,
  Calendar,
  Zap,
  Target,
  Award
} from 'lucide-react';

interface QuickActionsProps {
  referralCode?: string;
  isAdmin?: boolean;
}

export const QuickActions = ({ referralCode, isAdmin = false }: QuickActionsProps) => {
  const { user } = useAuth();
  const { updateSocialPosts } = useAmbassadorProfile(user?.id);
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialPostData, setSocialPostData] = useState({
    platform: '',
    post_url: '',
    post_content: ''
  });

  const handleSocialPostSubmit = async () => {
    if (!socialPostData.platform || !socialPostData.post_url) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateSocialPosts.mutateAsync(socialPostData);
      toast({
        title: "Success!",
        description: "Social post submitted for verification",
      });
      setSocialPostData({ platform: '', post_url: '', post_content: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit social post",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareReferralCode = async () => {
    const referralUrl = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join StarStore with my referral code!',
          text: `Use my referral code ${referralCode} to get started with StarStore`,
          url: referralUrl,
        });
      } catch (err) {
        logger.info('Share operation cancelled by user');
      }
    } else {
      await navigator.clipboard.writeText(referralUrl);
      toast({
        title: "Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const generateSocialContent = () => {
    const templates = [
      `🌟 Just discovered StarStore - the future of digital commerce! Use my code ${referralCode} to get started. #StarStore #DigitalCommerce`,
      `💫 Earning stars and rewards with every transaction on StarStore! Join me with code ${referralCode} #StarStoreAmbassador`,
      `🚀 Building the future of e-commerce with StarStore! Get exclusive access with my referral code ${referralCode}`,
      `⭐ Love how StarStore rewards quality transactions! Join the revolution with code ${referralCode} #QualityFirst`,
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    setSocialPostData(prev => ({ ...prev, post_content: randomTemplate }));
    
    toast({
      title: "Content Generated!",
      description: "Social media content has been generated for you",
    });
  };

  const ambassadorActions = [
    {
      title: 'Share Referral',
      description: 'Share your referral code on social media',
      icon: Share2,
      color: 'bg-primary/10 text-primary',
      action: shareReferralCode,
      disabled: !referralCode
    },
    {
      title: 'Submit Social Post',
      description: 'Submit your social media posts for verification',
      icon: MessageSquare,
      color: 'bg-success/10 text-success',
      dialog: 'social-post'
    },
    {
      title: 'Generate Content',
      description: 'Get AI-generated social media content',
      icon: Zap,
      color: 'bg-warning/10 text-warning',
      action: generateSocialContent
    },
    {
      title: 'View Analytics',
      description: 'Check your performance metrics',
      icon: TrendingUp,
      color: 'bg-info/10 text-info',
      action: () => {
        // Scroll to analytics section
        document.getElementById('analytics-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  const adminActions = [
    {
      title: 'Review Applications',
      description: 'Process pending ambassador applications',
      icon: FileText,
      color: 'bg-primary/10 text-primary',
      action: () => {
        // Navigate to applications tab
        const applicationsTab = document.querySelector('[data-tab="applications"]') as HTMLElement;
        applicationsTab?.click();
      }
    },
    {
      title: 'Manage Payouts',
      description: 'Process ambassador payouts',
      icon: Gift,
      color: 'bg-success/10 text-success',
      dialog: 'payout-management'
    },
    {
      title: 'System Analytics',
      description: 'View comprehensive system metrics',
      icon: TrendingUp,
      color: 'bg-info/10 text-info',
      action: () => {
        document.getElementById('admin-analytics')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: 'Bulk Actions',
      description: 'Perform bulk operations on data',
      icon: Users,
      color: 'bg-warning/10 text-warning',
      dialog: 'bulk-actions'
    }
  ];

  const actions = isAdmin ? adminActions : ambassadorActions;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Admin tools and shortcuts' : 'Boost your ambassador performance'}
          </p>
        </div>
        <Badge variant="outline">
          {isAdmin ? 'Admin' : 'Ambassador'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actions.map((action, index) => (
          <div key={index}>
            {action.dialog ? (
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full h-auto p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
disabled={'disabled' in action ? (action as any).disabled : false}
                  >
                    <div className={`p-2 rounded-lg ${action.color}`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">{action.title}</div>
                      <div className="text-sm text-muted-foreground">{action.description}</div>
                    </div>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  {action.dialog === 'social-post' && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Submit Social Post</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="platform">Platform</Label>
                          <Select
                            value={socialPostData.platform}
                            onValueChange={(value) => setSocialPostData(prev => ({ ...prev, platform: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="twitter">Twitter/X</SelectItem>
                              <SelectItem value="instagram">Instagram</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="facebook">Facebook</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="post_url">Post URL</Label>
                          <Input
                            id="post_url"
                            placeholder="https://..."
                            value={socialPostData.post_url}
                            onChange={(e) => setSocialPostData(prev => ({ ...prev, post_url: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="post_content">Content (Optional)</Label>
                          <Textarea
                            id="post_content"
                            placeholder="Paste your post content here..."
                            value={socialPostData.post_content}
                            onChange={(e) => setSocialPostData(prev => ({ ...prev, post_content: e.target.value }))}
                            rows={3}
                          />
                        </div>
                        
                        <Button
                          onClick={handleSocialPostSubmit}
                          disabled={isSubmitting}
                          className="w-full"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                        </Button>
                      </div>
                    </>
                  )}
                  
                  {action.dialog === 'payout-management' && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Payout Management</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                          <Gift className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Payout management tools</p>
                          <p className="text-sm mt-1">Coming soon...</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {action.dialog === 'bulk-actions' && (
                    <>
                      <DialogHeader>
                        <DialogTitle>Bulk Actions</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
                          <p>Bulk operation tools</p>
                          <p className="text-sm mt-1">Coming soon...</p>
                        </div>
                      </div>
                    </>
                  )}
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant="outline"
                className="w-full h-auto p-4 flex items-start gap-3 hover:shadow-md transition-shadow"
                onClick={action.action}
disabled={'disabled' in action ? (action as any).disabled : false}>

                <div className={`p-2 rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Performance Tips */}
      {!isAdmin && (
        <div className="mt-6 pt-6 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-primary" />
            <span className="font-medium text-sm">Performance Tips</span>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Award className="h-3 w-3" />
              <span>Post 4+ social media posts monthly to maintain tier status</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3 w-3" />
              <span>Focus on quality referrals - aim for 250+ stars per transaction</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              <span>Consistent activity helps build long-term earnings</span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};