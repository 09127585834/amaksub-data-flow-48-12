import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BillerLoadingSkeleton } from '@/components/ui/loading-skeleton';

const CableHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Persistent data fetching with retry logic
  const fetchTransactions = async (retryCount = 0) => {
    const maxRetries = 50;
    const retryDelay = 2000;
    
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'cable')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTransactions(data || []);
      setIsLoading(false);
    } catch (error) {
      console.log(`Fetch attempt ${retryCount + 1} failed, retrying...`);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchTransactions(retryCount + 1);
        }, retryDelay);
      } else {
        setTransactions([]);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'successful':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/cable')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">Cable History</h1>
        
        <div className="w-10" />
      </header>

      {/* Transaction List */}
      <div className="p-4">
        {isLoading ? (
          <BillerLoadingSkeleton count={6} />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium text-foreground mb-2">No transactions yet</p>
            <p className="text-sm text-muted-foreground">
              Your cable subscription history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-white p-4 rounded-xl border border-border shadow-sm"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {transaction.mobile_network?.toUpperCase()} Subscription
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.mobile_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ₦{parseFloat(transaction.amount).toLocaleString()}
                    </p>
                    <p className={`text-sm font-medium ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(transaction.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{formatTime(transaction.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CableHistoryPage;