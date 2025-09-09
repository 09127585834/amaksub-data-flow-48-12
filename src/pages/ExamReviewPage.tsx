import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ExamReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedExam, quantity, totalAmount } = location.state || {};

  if (!selectedExam) {
    navigate('/exam');
    return null;
  }

  const handleConfirmOrder = () => {
    navigate('/exam/transaction-pin', {
      state: {
        selectedExam,
        quantity,
        totalAmount,
        transactionType: 'exam'
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
          onClick={() => navigate('/exam')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <h1 className="text-lg font-semibold text-foreground">Confirm Order</h1>
        
        <div className="w-10" />
      </header>

      <div className="p-4 space-y-6">
        {/* Order Summary */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Exam Name</span>
              <span className="font-semibold text-foreground">{selectedExam.name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Quantity</span>
              <span className="font-semibold text-foreground">{quantity}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount</span>
              <span className="font-semibold text-foreground">₦{selectedExam.price.toLocaleString()}</span>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-foreground">Total Amount</span>
                <span className="text-lg font-bold text-primary">₦{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleConfirmOrder}
            className="h-14 text-lg font-semibold px-12"
            size="lg"
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExamReviewPage;