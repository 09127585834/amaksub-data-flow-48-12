import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Receipt } from 'lucide-react';

const CablePurchaseSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    transaction,
    selectedNetwork,
    selectedPlan,
    smartCardNumber,
    customerName,
    amount,
    totalAmount
  } = location.state || {};

  // Play success sound on mount
  useEffect(() => {
    const audio = new Audio('/sounds/success.mp3');
    audio.play().catch(e => console.log('Could not play sound:', e));
  }, []);

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleGenerateReceipt = () => {
    navigate('/receipt', {
      state: {
        transaction,
        amount: totalAmount || amount,
        selectedNetwork,
        selectedPlan,
        transactionType: 'cable',
        smartCardNumber,
        customerName
      }
    });
  };

  if (!transaction) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No transaction data found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Go to Dashboard
          </Button>
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
          onClick={handleGoBack}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Cable Subscription</h1>
        <div className="w-10" />
      </header>

      <div className="flex flex-col items-center justify-center px-4 py-12">
        {/* Success Icon */}
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-600" />
        </div>

        {/* Success Message */}
        <h2 className="text-2xl font-bold text-foreground mb-2 text-center">
          Subscription Successful!
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Your cable subscription has been activated successfully
        </p>

        {/* Transaction Details */}
        <div className="w-full max-w-sm bg-white rounded-lg border border-border p-6 mb-8">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="font-semibold">{selectedNetwork}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-semibold">{selectedPlan?.description}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Smart Card:</span>
              <span className="font-semibold">{smartCardNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Customer:</span>
              <span className="font-semibold">{customerName}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-lg">₦{(totalAmount || amount)?.toLocaleString()}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold text-green-600">Successful</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-medium text-sm">{transaction?.id || transaction?.order_id}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-muted-foreground">New Balance:</span>
              <span className="font-semibold">₦{transaction?.balance?.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm space-y-3">
          <Button 
            onClick={handleGenerateReceipt}
            className="w-full h-14 text-lg font-semibold"
          >
            <Receipt className="w-5 h-5 mr-2" />
            Generate Receipt
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleGoBack}
            className="w-full h-14 text-lg font-semibold"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CablePurchaseSuccessPage;