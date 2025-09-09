import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ElectricityReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    selectedBiller, 
    selectedBillerCode,
    paymentType,
    meterNumber,
    phoneNumber, 
    customerName,
    amount 
  } = location.state || {};

  const handleBackToForm = () => {
    navigate('/electricity', {
      state: {
        formData: {
          selectedBiller,
          selectedBillerCode,
          paymentType,
          meterNumber,
          phoneNumber,
          amount,
          validationResult: { isValid: true, customerName }
        }
      }
    });
  };

  const handleConfirm = () => {
    navigate('/electricity/transaction-pin', {
      state: {
        selectedBiller,
        selectedBillerCode,
        paymentType,
        meterNumber,
        phoneNumber,
        customerName,
        amount,
        transactionType: 'electricity'
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
            <span className="text-sm text-foreground">{selectedBiller}</span>
          </div>

          {/* Meter Number */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Meter Number:</span>
            <span className="text-sm text-foreground">{meterNumber}</span>
          </div>

          {/* Customer Name */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Customer Name:</span>
            <span className="text-sm text-foreground">{customerName}</span>
          </div>

          {/* Phone Number */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Phone Number:</span>
            <span className="text-sm text-foreground">{phoneNumber}</span>
          </div>

          {/* Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Amount:</span>
            <span className="text-sm font-bold text-foreground">₦{parseFloat(amount).toLocaleString()}</span>
          </div>

          {/* Percent */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Percent:</span>
            <span className="text-sm text-foreground">0.0%</span>
          </div>

          {/* Total Amount */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total Amount:</span>
            <span className="text-sm font-bold text-foreground">₦{parseFloat(amount).toLocaleString()}</span>
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

export default ElectricityReviewPage;