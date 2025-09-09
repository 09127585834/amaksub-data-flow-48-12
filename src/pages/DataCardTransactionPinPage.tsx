import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ScanFace } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createApiErrorHandler } from '@/lib/api-error-handler';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import avatarImage from '@/assets/avatar-3d-glasses.png';

const DataCardTransactionPinPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showInsufficientFunds, setShowInsufficientFunds] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [biometricRegistered, setBiometricRegistered] = useState<boolean | null>(null);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  const { 
    selectedNetwork, 
    selectedPlan, 
    quantity, 
    cardName, 
    totalAmount,
    selectedPlanType 
  } = location.state || {};

  // Check biometric availability and registration status
  useEffect(() => {
    const checkBiometric = async () => {
      // Check if biometric is available
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
      }

      // Check if user has registered biometric
      if (user?.id) {
        try {
          const { data } = await supabase
            .from('users')
            .select('biometric_registered')
            .eq('id', user.id)
            .maybeSingle();
          setBiometricRegistered(!!data?.biometric_registered);
        } catch (e) {
          console.error('Error fetching biometric status:', e);
        }
      }
    };
    checkBiometric();
  }, [user]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable || !biometricRegistered) {
      return;
    }

    try {
      setIsLoading(true);

      // Create credential request options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [], // Empty array allows any registered credential
        userVerification: 'required' as UserVerificationRequirement,
        timeout: 60000,
      };

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      }) as PublicKeyCredential;

      if (credential) {
        // Proceed with transaction processing
        await processTransaction();
      }
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      // Silent fail for biometric - user can use PIN instead
    } finally {
      setIsLoading(false);
    }
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

      // Check user balance
      const userBalance = parseFloat(userData.balance?.toString() || '0');
      if (userBalance < totalAmount) {
        setIsProcessing(false);
        setShowInsufficientFunds(true);
        return;
      }

      // Generate 9-digit reference ID
      const ref = Math.random().toString().slice(2, 11);

      // Map network to API values
      const networkMapping: { [key: string]: string } = {
        'MTN': '1',
        'Glo': '2',
        'Airtel': '4'
      };

      // Call VTUNAIJA API
      const { data: apiResponse, error: apiError } = await supabase.functions.invoke('vtunaija-data-card', {
        body: {
          network: networkMapping[selectedNetwork],
          quantity: quantity,
          data_plan: selectedPlan.value,
          businessname: cardName,
          ref: ref,
          user_id: user.id,
          amount: totalAmount
        }
      });

      if (apiError || !apiResponse.success) {
        setIsProcessing(false);
        setShowError(true);
        
        // Send error details via email
        const errorHandler = createApiErrorHandler('VTUNAIJA Data Card API');
        await errorHandler(
          `Data Card Purchase Failed - ${selectedNetwork}`,
          apiError || apiResponse,
          user?.user_metadata?.full_name || user?.email || 'Unknown User'
        );
        
        toast({
          title: "Transaction Failed",
          description: "Technical issue occurred. Please try again.",
          variant: "destructive"
        });
        return;
      }

      setIsProcessing(false);
      
      // Navigate to success page
      navigate('/data-card-success', {
        state: {
          selectedNetwork,
          quantity,
          cardName,
          totalAmount,
          pin: apiResponse.data.pin,
          serial: apiResponse.data.serial,
          validity: selectedPlan.validity,
          planSize: selectedPlan.size
        }
      });

    } catch (error) {
      console.error('Error processing transaction:', error);
      setIsProcessing(false);
      setShowError(true);
      toast({
        title: "Transaction Failed",
        description: "Technical issue occurred. Please try again.",
        variant: "destructive"
      });
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

  const handleBackToReview = () => {
    navigate('/data-card/review', {
      state: {
        selectedNetwork,
        selectedPlanType,
        selectedPlan,
        quantity,
        cardName
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
          
          {biometricRegistered && isBiometricAvailable ? (
            <button
              className="h-20 w-20 flex items-center justify-center text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none"
              onClick={handleBiometricAuth}
              disabled={isLoading || isProcessing}
              title="Use biometric authentication"
            >
              <ScanFace size={24} />
            </button>
          ) : (
            <div className="h-20 w-20"></div>
          )}
          
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
          <p className="text-red-500 mb-4 text-lg">Technical issue occurred. Please try again.</p>
          <Button onClick={handleErrorOk} className="px-8 w-full">
            Okay
          </Button>
        </div>
      )}

      {/* Insufficient Funds Overlay */}
      {showInsufficientFunds && (
        <div className="fixed inset-x-0 bottom-0 bg-background border-t border-border p-6 text-center z-50 rounded-t-lg shadow-lg">
          <p className="text-red-500 mb-4 text-lg">Insufficient funds</p>
          <Button onClick={handleInsufficientFundsOk} className="px-8 w-full">
            Okay
          </Button>
        </div>
      )}
    </div>
  );
};

export default DataCardTransactionPinPage;