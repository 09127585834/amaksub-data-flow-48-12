import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';

const DataCardReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    selectedNetwork,
    selectedPlanType,
    selectedPlan,
    quantity,
    cardName
  } = location.state || {};

  const networkLogos = {
    'MTN': mtnLogo,
    'Airtel': airtelLogo,
    'Glo': gloLogo,
  };

  const totalAmount = selectedPlan?.price * parseInt(quantity || '1');

  const handleBackToForm = () => {
    navigate('/data-card', {
      state: {
        formData: {
          selectedNetwork,
          quantity,
          cardName,
          selectedPlanType
        }
      }
    });
  };

  const handleConfirm = () => {
    navigate('/data-card/transaction-pin', {
      state: {
        selectedNetwork,
        selectedPlanType,
        selectedPlan,
        quantity,
        cardName,
        totalAmount,
        transactionType: 'data-card'
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
          onClick={handleBackToForm}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Confirm Order</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Order Details */}
        <div className="space-y-6 mb-8">
          {/* Biller */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Biller:</span>
            <div className="flex items-center space-x-2">
              {selectedNetwork && (
                <img 
                  src={networkLogos[selectedNetwork as keyof typeof networkLogos]} 
                  alt={selectedNetwork} 
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>
          </div>

          {/* Network */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Network:</span>
            <span className="text-sm text-foreground">{selectedNetwork}</span>
          </div>

          {/* Valid */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Valid:</span>
            <span className="text-sm text-foreground">{selectedPlan?.validity}</span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Price:</span>
            <span className="text-sm text-foreground">₦{selectedPlan?.price?.toLocaleString()}</span>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Quantity:</span>
            <span className="text-sm text-foreground">{quantity}</span>
          </div>

          {/* Card Name */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Card Name:</span>
            <span className="text-sm text-foreground">{cardName}</span>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total Amount:</span>
            <span className="text-sm font-bold text-foreground">₦{totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button 
          onClick={handleConfirm}
          className="w-full h-14 text-lg font-semibold"
          size="lg"
        >
          Confirm
        </Button>
      </div>
    </div>
  );
};

export default DataCardReviewPage;