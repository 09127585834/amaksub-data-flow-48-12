import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

interface Transaction {
  id: string;
  amount: number;
  mobile_network: string;
  mobile_number: string;
  created_at: string;
  order_id: string | null;
  api_response: any;
}

const PrintRechargeHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRechargeHistory();
  }, []);

  const fetchRechargeHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to view your history",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'recharge_card')
        .eq('status', 'successful')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        toast({
          title: "Error",
          description: "Failed to fetch recharge history",
          variant: "destructive"
        });
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recharge history",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleTransactionClick = (transaction: Transaction) => {
    navigate('/print-recharge-detail', { 
      state: { 
        transaction,
        amount: transaction.amount,
        selectedNetwork: transaction.mobile_network,
        quantity: transaction.api_response?.quantity || 1,
        pins: transaction.api_response?.pins || [],
        nameOnCard: 'Recharge Card'
      } 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Recharge History</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gradient-to-r from-primary/20 to-primary/30 rounded animate-shimmer"></div>
                        <div className="h-3 bg-gradient-to-r from-primary/15 to-primary/25 rounded w-2/3 animate-shimmer"></div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-primary/20 to-primary/30 rounded w-16 animate-shimmer"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No Recharge History
              </h3>
              <p className="text-sm text-muted-foreground">
                You haven't made any successful recharge card purchases yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card 
                key={transaction.id}
                className="cursor-pointer hover:shadow-md transition-shadow bg-gradient-to-r from-background to-primary/5 border border-primary/10"
                onClick={() => handleTransactionClick(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground capitalize">
                          {transaction.mobile_network} Recharge Card
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.created_at)}</span>
                        <span>•</span>
                        <span>{transaction.mobile_number}</span>
                      </div>
                      {transaction.order_id && (
                        <div className="text-xs text-muted-foreground">
                          Order: {transaction.order_id}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">
                        ₦{transaction.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrintRechargeHistoryPage;