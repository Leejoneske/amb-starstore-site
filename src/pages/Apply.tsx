import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Star, Upload } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const Apply = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    telegram: "",
    twitter: "",
    instagram: "",
    youtube: "",
    audienceSize: "",
    platform: "",
    experience: "",
    why: "",
    referralMethod: "",
    agreement: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreement) {
      toast({
        title: "Agreement Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    // Simulate submission - will be replaced with actual API call
    setTimeout(() => {
      toast({
        title: "Application Submitted!",
        description: "We'll review your application and get back to you within 48 hours.",
      });
      navigate("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="p-8 md:p-12 glass-card">
          <div className="flex flex-col items-center mb-8">
            <div className="p-3 rounded-full bg-primary/10 mb-4">
              <Star className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold text-center">Ambassador Application</h1>
            <p className="text-muted-foreground mt-2 text-center max-w-2xl">
              Join our elite community and start earning. Applications are reviewed within 48 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Personal Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="United States"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Social Media Presence</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram Username *</Label>
                  <Input
                    id="telegram"
                    placeholder="@username"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter/X Handle</Label>
                  <Input
                    id="twitter"
                    placeholder="@username"
                    value={formData.twitter}
                    onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">Instagram Handle</Label>
                  <Input
                    id="instagram"
                    placeholder="@username"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtube">YouTube Channel</Label>
                  <Input
                    id="youtube"
                    placeholder="Channel URL or @handle"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Primary Platform *</Label>
                <RadioGroup 
                  value={formData.platform}
                  onValueChange={(value) => setFormData({ ...formData, platform: value })}
                  required
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="telegram" id="telegram-radio" />
                    <Label htmlFor="telegram-radio" className="font-normal cursor-pointer">Telegram</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="twitter" id="twitter-radio" />
                    <Label htmlFor="twitter-radio" className="font-normal cursor-pointer">Twitter/X</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="instagram" id="instagram-radio" />
                    <Label htmlFor="instagram-radio" className="font-normal cursor-pointer">Instagram</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="youtube" id="youtube-radio" />
                    <Label htmlFor="youtube-radio" className="font-normal cursor-pointer">YouTube</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other-radio" />
                    <Label htmlFor="other-radio" className="font-normal cursor-pointer">Other</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="audienceSize">Total Audience Size *</Label>
                <Select 
                  value={formData.audienceSize}
                  onValueChange={(value) => setFormData({ ...formData, audienceSize: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your audience size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-1k">Less than 1,000</SelectItem>
                    <SelectItem value="1k-10k">1,000 - 10,000</SelectItem>
                    <SelectItem value="10k-50k">10,000 - 50,000</SelectItem>
                    <SelectItem value="50k-100k">50,000 - 100,000</SelectItem>
                    <SelectItem value="100k+">100,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Ambassador Experience */}
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold">Ambassador Experience</h2>
              
              <div className="space-y-2">
                <Label htmlFor="experience">Previous Ambassador/Affiliate Experience</Label>
                <Textarea
                  id="experience"
                  placeholder="Tell us about your previous ambassador or affiliate marketing experience..."
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="why">Why do you want to become a StarStore Ambassador? *</Label>
                <Textarea
                  id="why"
                  placeholder="Share your motivation and what makes you a great fit for our program..."
                  value={formData.why}
                  onChange={(e) => setFormData({ ...formData, why: e.target.value })}
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralMethod">How will you promote StarStore? *</Label>
                <Textarea
                  id="referralMethod"
                  placeholder="Describe your promotion strategy (e.g., content creation, community engagement, etc.)"
                  value={formData.referralMethod}
                  onChange={(e) => setFormData({ ...formData, referralMethod: e.target.value })}
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Agreement */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/50">
                <Checkbox
                  id="agreement"
                  checked={formData.agreement}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, agreement: checked as boolean })
                  }
                />
                <Label htmlFor="agreement" className="text-sm font-normal cursor-pointer leading-relaxed">
                  I agree to the StarStore Ambassador Program terms and conditions. I understand that 
                  my application will be reviewed and I may be contacted for additional information. 
                  I commit to promoting StarStore authentically and in accordance with program guidelines.
                </Label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button type="submit" size="lg" className="flex-1" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Application"}
              </Button>
              <Link to="/" className="flex-1">
                <Button type="button" variant="outline" size="lg" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Apply;
