import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ElectricityTransaction {
  id: string;
  amount: number;
  created_at: string;
  status: string;
  mobile_number: string;
  mobile_network: string;
}

const ElectricityHistoryPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<ElectricityTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElectricityTransactions();
  }, []);

  const fetchElectricityTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('transaction_history')
        .select('*')
        .eq('user_id', user.id)
        .eq('transaction_type', 'electricity')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
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

  const formatAmount = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="flex justify-between items-center p-4 bg-background">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="h-10 w-10 no-focus-active"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          
          <h1 className="text-xl font-semibold text-foreground">Electricity History</h1>
          
          <div className="w-10" />
        </header>

        {/* Glossy Loading Effect */}
        <div className="p-6">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div 
                key={i}
                className="h-20 rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:200%_100%] animate-[shimmer_2s_infinite] border border-border"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite'
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">Electricity History</h1>
        
        <div className="w-10" />
      </header>

      {/* Content */}
      <div className="p-6">
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center space-y-3">
              <h3 className="text-lg font-medium text-muted-foreground">No Electricity Transactions</h3>
              <p className="text-sm text-muted-foreground">
                You haven't made any successful electricity transactions yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="p-4 rounded-lg border border-border bg-card"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {formatAmount(transaction.amount)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.mobile_network} • {transaction.mobile_number}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                      Completed
                    </div>
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

export default ElectricityHistoryPage;