import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  created_at: string;
  mobile_number: string;
  mobile_network: string;
  amount: number;
  status: string;
  api_response?: any;
}

const DataCardHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDataCardHistory();
  }, [user, navigate]);

  const fetchDataCardHistory = async () => {
    if (!user) return;

    // No retry logic - just continuous silent fetching
    try {
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'data-card')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching data card history:', error);
      // No toast notifications - silent handling
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="flex items-center justify-between p-4 bg-background">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/data-card')}
            className="h-10 w-10 no-focus-active"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Data Card History</h1>
          <div className="w-10" />
        </header>

        <div className="p-4">
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-3xl overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/50 rounded animate-pulse shadow-lg"></div>
                        <div className="h-3 bg-gradient-to-r from-primary/20 to-primary/40 rounded w-2/3 animate-pulse shadow-md"></div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-primary/30 to-primary/50 rounded w-16 animate-pulse shadow-lg"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/data-card')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Data Card History</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No data card transactions found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-foreground">{transaction.mobile_network} Data Card</p>
                    <p className="text-sm text-muted-foreground">{transaction.mobile_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{formatAmount(transaction.amount)}</p>
                    <p className="text-xs text-green-600 capitalize">{transaction.status}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(transaction.created_at)}
                </div>
                {transaction.api_response?.transactionID && (
                  <div className="text-xs text-muted-foreground mt-1">
                    ID: {transaction.api_response.transactionID}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCardHistoryPage;