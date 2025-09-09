import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import avatarImage from '@/assets/avatar-3d-glasses.png';

const ExamTransactionPinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { selectedExam, quantity, totalAmount } = location.state || {};

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const processTransaction = async () => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      // Check user PIN first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('balance, transaction_pin')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Verify PIN
      if (userData.transaction_pin !== pin) {
        setIsProcessing(false);
        setShowError(true);
        return;
      }

      // Check balance
      const userBalance = parseFloat(userData.balance?.toString() || '0');
      if (userBalance < totalAmount) {
        setIsProcessing(false);
        setShowInsufficientFunds(true);
        return;
      }

      // Show coming soon message
      setIsProcessing(false);
      setShowComingSoon(true);
      
    } catch (error) {
      console.error('Error processing exam transaction:', error);
      setIsProcessing(false);
      setShowError(true);
    }
  };

  const verifyPin = async () => {
    if (!user || pin.length !== 4) return;
    setIsLoading(true);
    await processTransaction();
    setIsLoading(false);
  };

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const handleErrorOk = () => {
    setShowError(false);
    setIsLoading(false);
    setIsProcessing(false);
    setPin('');
  };

  const handleInsufficientFundsOk = () => {
    setShowInsufficientFunds(false);
    setIsLoading(false);
    setIsProcessing(false);
    setPin('');
  };

  const handleComingSoonOk = () => {
    setShowComingSoon(false);
    navigate('/dashboard');
  };

  const handleBackToReview = () => {
    navigate('/exam/review', {
      state: {
        selectedExam,
        quantity,
        totalAmount
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
          onClick={handleBackToReview}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="w-10" />
      </header>

      <div className="flex flex-col items-center p-4">
        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground text-center mb-8">
          Enter your 4 digit transaction pin
        </h1>

        {/* Avatar */}
        <div className="mb-8">
          <img 
            src={avatarImage} 
            alt="User Avatar" 
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {/* PIN Display */}
        <div className="flex space-x-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                index < pin.length 
                  ? 'bg-primary border-primary' 
                  : 'border-border'
              }`}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-8 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
              onClick={() => handlePinInput(digit.toString())}
            >
              {digit}
            </button>
          ))}
          
          <div className="h-20 w-20"></div>
          
          <button
            className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
            onClick={() => handlePinInput('0')}
          >
            0
          </button>
          
          <button
            className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
            onClick={handleBackspace}
          >
            ⌫
          </button>
        </div>
      </div>

      {/* Loading Popup */}
      {(isLoading || isProcessing) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-2">
                <img 
                  src="/lovable-uploads/8f7f7ca2-68e2-4ebe-97d2-16b3abf34b89.png" 
                  alt="Amaksub Data" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg font-semibold">Please wait</p>
          </div>
        </div>
      )}

      {/* Error Overlay */}
      {showError && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-6 text-center z-50 rounded-t-lg shadow-lg">
          <p className="text-red-500 mb-4 text-lg">Incorrect pin. Please try again.</p>
          <Button onClick={handleErrorOk} className="px-8 w-full">
            Okay
          </Button>
        </div>
      )}

      {/* Insufficient Funds Overlay */}
      {showInsufficientFunds && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-6 text-center z-50 rounded-t-lg shadow-lg">
          <p className="text-red-500 mb-4 text-lg">Insufficient Balance</p>
          <Button onClick={handleInsufficientFundsOk} className="px-8 w-full">
            Okay
          </Button>
        </div>
      )}

      {/* Coming Soon Overlay */}
      {showComingSoon && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-6 text-center z-50 rounded-t-lg shadow-lg">
          <p className="text-primary mb-4 text-lg">Exam service coming soon!</p>
          <Button onClick={handleComingSoonOk} className="px-8 w-full">
            Okay
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExamTransactionPinPage;