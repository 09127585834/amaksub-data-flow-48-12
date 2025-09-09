import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const CableReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const {
    selectedNetwork,
    selectedPlan,
    smartCardNumber,
    customerName
  } = location.state || {};

  const directCharges = 4;
  const planAmount = selectedPlan?.price ? parseFloat(selectedPlan.price) : 0;
  const totalAmount = planAmount + directCharges;

  const handleConfirmOrder = () => {
    navigate('/cable/transaction-pin', {
      state: {
        selectedNetwork,
        selectedPlan,
        smartCardNumber,
        customerName,
        amount: planAmount,
        totalAmount
      }
    });
  };

  const handleBack = () => {
    navigate('/cable', {
      state: {
        selectedPlan,
        selectedBeneficiary: {
          smartCardNumber,
          selectedNetwork
        }
      }
    });
  };

  const getNetworkDisplayName = () => {
    return selectedNetwork?.toUpperCase() || '';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-lg font-semibold text-foreground">Confirm Transaction Details</h1>
        
        <div className="w-10" />
      </header>

      {/* Transaction Details */}
      <div className="p-6 space-y-6">
        <div className="bg-card rounded-lg p-4 space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Cable</span>
            <span className="font-medium text-foreground">{getNetworkDisplayName()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Cable Plan</span>
            <span className="font-medium text-foreground">{selectedPlan?.description || 'N/A'}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Smart Card Number/Decoder Number</span>
            <span className="font-medium text-foreground">{smartCardNumber}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Customer Name</span>
            <span className="font-medium text-foreground">{customerName}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Amount</span>
            <span className="font-medium text-foreground">₦{planAmount.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-border">
            <span className="text-muted-foreground">Direct Charges</span>
            <span className="font-medium text-foreground">₦{directCharges}</span>
          </div>
          
          <div className="flex justify-between items-center py-2">
            <span className="text-foreground font-semibold">Total Amount</span>
            <span className="font-semibold text-foreground text-lg">₦{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Confirm Button */}
        <Button
          onClick={handleConfirmOrder}
          className="w-full h-14 text-lg font-semibold"
        >
          Confirm Order
        </Button>
      </div>
    </div>
  );
};

export default CableReviewPage;