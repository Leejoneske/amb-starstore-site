import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { messageService, type MessageFilter, type MessageType } from '@/services/messageService';
import { 
  Mail, 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Send,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

interface MessageStats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

const MESSAGE_TYPES: { value: MessageType; label: string }[] = [
  { value: 'welcome', label: 'Welcome' },
  { value: 'approval', label: 'Approval' },
  { value: 'rejection', label: 'Rejection' },
  { value: 'login_credentials', label: 'Login Credentials' },
  { value: 'password_reset', label: 'Password Reset' },
  { value: 'tier_upgrade', label: 'Tier Upgrade' },
  { value: 'commission_payout', label: 'Commission Payout' },
  { value: 'referral_activation', label: 'Referral Activation' },
  { value: 'monthly_report', label: 'Monthly Report' },
  { value: 'system_notification', label: 'System Notification' },
  { value: 'manual_email', label: 'Manual Email' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'announcement', label: 'Announcement' }
];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  delivered: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  opened: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  clicked: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  bounced: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
};

export const MessageCenter = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [stats, setStats] = useState<MessageStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [messageEvents, setMessageEvents] = useState<any[]>([]);
  const [filter, setFilter] = useState<MessageFilter>({
    limit: 50,
    offset: 0
  });
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  // Load messages
  const loadMessages = async () => {
    setLoading(true);
    try {
      const result = await messageService.getMessages(filter);
      if (result.success) {
        setMessages(result.messages || []);
        setTotal(result.total || 0);
      } else {
        toast({
          title: "Failed to load messages",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading messages",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const result = await messageService.getMessageStats();
      if (result.success) {
        setStats(result.stats || null);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Load message details
  const loadMessageDetails = async (messageId: string) => {
    try {
      const result = await messageService.getMessageById(messageId);
      if (result.success) {
        setSelectedMessage(result.message);
        setMessageEvents(result.events || []);
      } else {
        toast({
          title: "Failed to load message details",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error loading message details",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Apply search filter
  const handleSearch = () => {
    setFilter(prev => ({
      ...prev,
      search: searchTerm || undefined,
      offset: 0
    }));
  };

  // Apply filters
  const handleFilterChange = (key: keyof MessageFilter, value: any) => {
    setFilter(prev => ({
      ...prev,
      [key]: value,
      offset: 0
    }));
  };

  // Pagination
  const handlePageChange = (direction: 'next' | 'prev') => {
    const newOffset = direction === 'next' 
      ? (filter.offset || 0) + (filter.limit || 50)
      : Math.max(0, (filter.offset || 0) - (filter.limit || 50));
    
    setFilter(prev => ({ ...prev, offset: newOffset }));
  };

  // Load data on mount and filter changes
  useEffect(() => {
    loadMessages();
  }, [filter]);

  useEffect(() => {
    loadStats();
  }, []);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'opened': return <Eye className="h-4 w-4" />;
      case 'clicked': return <TrendingUp className="h-4 w-4" />;
      case 'failed': case 'bounced': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Message Center</h2>
          <p className="text-muted-foreground">
            Track all emails sent to users including automated messages
          </p>
        </div>
        <Button onClick={() => { loadMessages(); loadStats(); }} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.deliveryRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.openRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.clickRate}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="messages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="messages">All Messages</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="messages" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Search messages..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Message Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={filter.messageType || 'all'} 
                    onValueChange={(value) => handleFilterChange('messageType', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {MESSAGE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select 
                    value={filter.status || 'all'} 
                    onValueChange={(value) => handleFilterChange('status', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="opened">Opened</SelectItem>
                      <SelectItem value="clicked">Clicked</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="bounced">Bounced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select 
                    value={filter.priority || 'all'} 
                    onValueChange={(value) => handleFilterChange('priority', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All priorities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Messages Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Messages ({total.toLocaleString()})</span>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Recipient</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{message.recipient_name || 'Unknown'}</div>
                            <div className="text-sm text-muted-foreground">{message.recipient_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate" title={message.subject}>
                            {message.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {MESSAGE_TYPES.find(t => t.value === message.message_type)?.label || message.message_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={STATUS_COLORS[message.status as keyof typeof STATUS_COLORS]}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(message.status)}
                              {message.status}
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={PRIORITY_COLORS[message.priority as keyof typeof PRIORITY_COLORS]}>
                            {message.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {message.sent_at ? formatDate(message.sent_at) : 
                           message.created_at ? formatDate(message.created_at) : 'Not sent'}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => loadMessageDetails(message.id)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Message Details</DialogTitle>
                                <DialogDescription>
                                  View complete message information and tracking events
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedMessage && (
                                <div className="space-y-6">
                                  {/* Message Info */}
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Message Information</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>To:</strong> {selectedMessage.recipient_name} ({selectedMessage.recipient_email})</div>
                                        <div><strong>Subject:</strong> {selectedMessage.subject}</div>
                                        <div><strong>Type:</strong> {selectedMessage.message_type}</div>
                                        <div><strong>Status:</strong> 
                                          <Badge className={`ml-2 ${STATUS_COLORS[selectedMessage.status as keyof typeof STATUS_COLORS]}`}>
                                            {selectedMessage.status}
                                          </Badge>
                                        </div>
                                        <div><strong>Priority:</strong> 
                                          <Badge className={`ml-2 ${PRIORITY_COLORS[selectedMessage.priority as keyof typeof PRIORITY_COLORS]}`}>
                                            {selectedMessage.priority}
                                          </Badge>
                                        </div>
                                        <div><strong>Sent Via:</strong> {selectedMessage.sent_via}</div>
                                        <div><strong>Template:</strong> {selectedMessage.template_name || 'None'}</div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <h4 className="font-semibold mb-2">Timestamps</h4>
                                      <div className="space-y-2 text-sm">
                                        <div><strong>Created:</strong> {formatDate(selectedMessage.created_at)}</div>
                                        {selectedMessage.sent_at && <div><strong>Sent:</strong> {formatDate(selectedMessage.sent_at)}</div>}
                                        {selectedMessage.delivered_at && <div><strong>Delivered:</strong> {formatDate(selectedMessage.delivered_at)}</div>}
                                        {selectedMessage.opened_at && <div><strong>Opened:</strong> {formatDate(selectedMessage.opened_at)}</div>}
                                        {selectedMessage.clicked_at && <div><strong>Clicked:</strong> {formatDate(selectedMessage.clicked_at)}</div>}
                                        {selectedMessage.failed_at && <div><strong>Failed:</strong> {formatDate(selectedMessage.failed_at)}</div>}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Content */}
                                  {selectedMessage.content_html && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Message Content</h4>
                                      <div 
                                        className="border rounded p-4 bg-muted/50 max-h-60 overflow-y-auto"
                                        dangerouslySetInnerHTML={{ __html: selectedMessage.content_html }}
                                      />
                                    </div>
                                  )}

                                  {/* Events */}
                                  {messageEvents.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Tracking Events</h4>
                                      <div className="space-y-2">
                                        {messageEvents.map((event, index) => (
                                          <div key={index} className="flex items-center gap-3 p-2 bg-muted/50 rounded">
                                            {getStatusIcon(event.event_type)}
                                            <div className="flex-1">
                                              <div className="font-medium">{event.event_type}</div>
                                              <div className="text-sm text-muted-foreground">
                                                {formatDate(event.occurred_at)}
                                              </div>
                                            </div>
                                            {event.ip_address && (
                                              <div className="text-xs text-muted-foreground">
                                                {event.ip_address}
                                              </div>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Error Info */}
                                  {selectedMessage.error_message && (
                                    <div>
                                      <h4 className="font-semibold mb-2 text-red-600">Error Details</h4>
                                      <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded">
                                        <p className="text-sm text-red-800 dark:text-red-200">
                                          {selectedMessage.error_message}
                                        </p>
                                        {selectedMessage.retry_count > 0 && (
                                          <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            Retry attempts: {selectedMessage.retry_count}/{selectedMessage.max_retries}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {(filter.offset || 0) + 1} to {Math.min((filter.offset || 0) + (filter.limit || 50), total)} of {total} messages
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange('prev')}
                    disabled={(filter.offset || 0) === 0}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handlePageChange('next')}
                    disabled={(filter.offset || 0) + (filter.limit || 50) >= total}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byStatus).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <span className="capitalize">{status}</span>
                        </div>
                        <Badge className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
                          {count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Type Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Messages by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(stats.byType).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="capitalize">
                          {MESSAGE_TYPES.find(t => t.value === type)?.label || type}
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};