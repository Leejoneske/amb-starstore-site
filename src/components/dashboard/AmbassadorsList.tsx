import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  TrendingUp,
  Mail,
  RefreshCw,
  Download
} from 'lucide-react';
import { useAllAmbassadors } from '@/hooks/useAllAmbassadors';
import { useToast } from '@/hooks/use-toast';
import { getTierBadgeClass } from '@/lib/tier-utils';

export const AmbassadorsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { ambassadors, isLoading } = useAllAmbassadors();
  const { toast } = useToast();

  const filteredAmbassadors = ambassadors?.filter(amb => {
    const name = amb.profiles?.full_name || '';
    const email = amb.profiles?.email || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           amb.referral_code?.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const exportData = () => {
    if (!ambassadors || ambassadors.length === 0) {
      toast({
        title: "No Data",
        description: "No ambassadors to export",
        variant: "destructive",
      });
      return;
    }

    const csvData = ambassadors.map(amb => ({
      'Name': amb.profiles?.full_name || 'N/A',
      'Email': amb.profiles?.email || 'N/A',
      'Tier': amb.current_tier,
      'Referrals': amb.total_referrals,
      'Active Referrals': amb.active_referrals,
      'Earnings': `$${amb.total_earnings?.toFixed(2) || '0.00'}`,
      'Status': amb.status,
      'Referral Code': amb.referral_code || 'N/A',
      'Telegram ID': amb.telegram_id || 'N/A',
      'Quality Rate': `${amb.quality_transaction_rate?.toFixed(1) || 0}%`
    }));

    const csvContent = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ambassadors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Ambassadors data exported successfully",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ambassadors</CardTitle>
          <CardDescription>Loading ambassadors...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Ambassadors
            </CardTitle>
            <CardDescription>
              {ambassadors?.length || 0} total ambassadors
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or referral code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredAmbassadors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-lg font-medium">No ambassadors found</p>
              <p className="text-sm mt-1">
                {searchTerm ? 'Try adjusting your search' : 'No ambassadors have been approved yet'}
              </p>
            </div>
          ) : (
            filteredAmbassadors.map((amb) => (
              <Card key={amb.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-semibold text-primary">
                        {(amb.profiles?.full_name || 'A').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-semibold text-lg">
                          {amb.profiles?.full_name || 'Unknown Ambassador'}
                        </h4>
                        <Badge className={`${getTierBadgeClass(amb.current_tier)} text-white border-none`}>
                          {amb.current_tier}
                        </Badge>
                        <Badge variant={amb.status === 'active' ? 'default' : 'secondary'}>
                          {amb.status}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <Mail className="h-3 w-3" />
                        <span>{amb.profiles?.email || 'No email'}</span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-primary" />
                          <span className="font-medium">{amb.total_referrals}</span>
                          <span className="text-muted-foreground">referrals</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-success" />
                          <span className="font-medium text-success">${amb.total_earnings?.toFixed(2) || '0.00'}</span>
                          <span className="text-muted-foreground">earned</span>
                        </div>
                        {amb.telegram_id && (
                          <Badge variant="outline" className="text-xs">
                            TG: {amb.telegram_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      {amb.referral_code}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {amb.quality_transaction_rate?.toFixed(1) || 0}% quality
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
