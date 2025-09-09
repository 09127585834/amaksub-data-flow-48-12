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
  transaction_type: string;
  status: string;
  order_id: string | null;
  api_response: any;
}

const TransactionHistoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return;
      }

      // For wallet funding transactions, fetch without user email filtering
      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
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

  const getTransactionTitle = (transaction: Transaction) => {
    switch (transaction.transaction_type) {
      case 'data_bundle':
        return `Data Bundle`;
      case 'airtime':
        return `${transaction.mobile_network} Airtime`;
      case 'cable':
        return 'Cable Subscription';
      case 'electricity':
        return 'Electricity Bill';
      case 'recharge_card':
        return `${transaction.mobile_network} Recharge Card`;
      case 'data_card':
        return `${transaction.mobile_network} Data Card`;
      case 'wallet_funding':
        return 'Wallet Funding';
      default:
        return transaction.transaction_type || 'Transaction';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'successful':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'pending':
        return 'text-yellow-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const handleTransactionClick = (transaction: Transaction) => {
    if (transaction.status === 'failed') {
      navigate('/failed-transaction-receipt', { 
        state: { 
          transaction,
          amount: transaction.amount,
          selectedNetwork: transaction.mobile_network,
          mobileNumber: transaction.mobile_number,
          transactionType: transaction.transaction_type
        } 
      });
      } else if (transaction.transaction_type === 'wallet_funding') {
        navigate('/wallet-funding-receipt', { 
          state: { 
            transaction,
            amount: transaction.amount
          } 
        });
      } else if (transaction.transaction_type === 'cable') {
        navigate('/receipt', { 
          state: { 
            transaction,
            amount: transaction.amount,
            selectedNetwork: transaction.mobile_network,
            smartCardNumber: transaction.mobile_number,
            transactionType: transaction.transaction_type,
            customerName: transaction.api_response?.customer_name || 'N/A'
          } 
        });
      } else {
        navigate('/receipt', { 
          state: { 
            transaction,
            amount: transaction.amount,
            selectedNetwork: transaction.mobile_network,
            mobileNumber: transaction.mobile_number,
            transactionType: transaction.transaction_type
          } 
        });
      }
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
        <h1 className="text-lg font-semibold text-foreground">Transaction History</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <Card className="bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-3xl overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gradient-to-r from-primary/30 to-primary/50 rounded animate-pulse shadow-lg"></div>
                        <div className="h-3 bg-gradient-to-r from-primary/20 to-primary/40 rounded w-2/3 animate-pulse shadow-md"></div>
                      </div>
                      <div className="h-6 bg-gradient-to-r from-primary/30 to-primary/50 rounded w-16 animate-pulse shadow-lg"></div>
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
                No Transaction History
              </h3>
              <p className="text-sm text-muted-foreground">
                You haven't made any transactions yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card 
                key={transaction.id}
                className="cursor-pointer bg-gradient-to-r from-background to-primary/5 border-2 border-primary/20 rounded-3xl transition-all duration-200"
                onClick={() => handleTransactionClick(transaction)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {getTransactionTitle(transaction)}
                        </span>
                        <span className={`text-xs font-medium capitalize ${getStatusColor(transaction.status)}`}>
                          {transaction.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{formatDate(transaction.created_at)}</span>
                        {transaction.transaction_type !== 'wallet_funding' && transaction.mobile_number && (
                          <>
                            <span>•</span>
                            <span>{transaction.mobile_number}</span>
                          </>
                        )}
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

export default TransactionHistoryPage;