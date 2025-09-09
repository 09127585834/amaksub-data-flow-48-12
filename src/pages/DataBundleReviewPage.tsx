import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';

const DataBundleReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    selectedNetwork,
    selectedPlanType,
    selectedPlan,
    mobileNumber
  } = location.state || {};

  const networkLogos = {
    'MTN': mtnLogo,
    'Airtel': airtelLogo,
    'Glo': gloLogo,
    '9mobile': nineMobileLogo,
  };

  const handleBackToForm = () => {
    navigate('/data-bundle', {
      state: {
        formData: {
          mobileNumber,
          selectedNetwork,
          selectedPlanType
        }
      }
    });
  };

  const handleConfirm = () => {
    navigate('/data-bundle/transaction-pin', {
      state: {
        selectedNetwork,
        selectedPlanType,
        selectedPlan,
        mobileNumber,
        transactionType: 'data-bundle'
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

          {/* Plan Name */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Plan Name:</span>
            <span className="text-sm text-foreground">{selectedPlan?.size}</span>
          </div>

          {/* Plan Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Plan Type:</span>
            <span className="text-sm text-foreground">{selectedPlanType}</span>
          </div>

          {/* Validity */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Validity:</span>
            <span className="text-sm text-foreground">{selectedPlan?.validity}</span>
          </div>

          {/* Mobile Number */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Mobile Number:</span>
            <span className="text-sm text-foreground">{mobileNumber}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Amount:</span>
            <span className="text-sm font-bold text-foreground">₦{selectedPlan?.price?.toLocaleString()}</span>
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

export default DataBundleReviewPage;