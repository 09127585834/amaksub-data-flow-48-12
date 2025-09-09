import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Contact, Check, X, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
// Use new uploaded cable logos
const dstvLogo = '/lovable-uploads/203c70a2-3372-4cb4-8ea8-8f4019344964.png';
const gotvLogo = '/lovable-uploads/59829138-a07e-4e74-9852-b8e1c7b5dc5b.png';
const startimesLogo = '/lovable-uploads/1a4924e2-6cd2-4672-a667-db2e71fe2764.png';

const CablePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [smartCardNumber, setSmartCardNumber] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [customerName, setCustomerName] = useState('');

  const cableNetworks = [
    { name: 'DSTV', logo: dstvLogo, value: 'dstv' },
    { name: 'GOTV', logo: gotvLogo, value: 'gotv' },
    { name: 'STARTIMES', logo: startimesLogo, value: 'startimes' }
  ];

  // Handle beneficiary selection and plan return
  useEffect(() => {
    if (location.state?.selectedBeneficiary) {
      const { smartCardNumber, selectedNetwork } = location.state.selectedBeneficiary;
      setSmartCardNumber(smartCardNumber);
      setSelectedNetwork(selectedNetwork);
      // Clear the state to prevent repeated auto-filling
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    // Handle plan selection return from plans page
    if (location.state?.selectedPlan) {
      const { selectedPlan, selectedNetwork: networkFromPlans } = location.state;
      setSelectedPlan(selectedPlan);
      // Preserve the selected network if it exists
      if (networkFromPlans && networkFromPlans !== selectedNetwork) {
        setSelectedNetwork(networkFromPlans);
      }
      // Clear the state to prevent repeated auto-filling
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    setSelectedPlan(null);
    // Reset verification when network changes
    setVerificationStatus('idle');
    setCustomerName('');
  };

  const handlePlanSelect = () => {
    if (!selectedNetwork) return;
    
    navigate('/cable/plans', {
      state: {
        selectedNetwork,
        smartCardNumber
      }
    });
  };

  const handlePlanReturn = (plan: any) => {
    setSelectedPlan(plan);
  };

  const handleBeneficiaryClick = () => {
    navigate('/beneficiary', {
      state: {
        serviceType: 'cable',
        returnPath: '/cable'
      }
    });
  };

  const handleHistoryClick = () => {
    navigate('/cable/history');
  };

  // Debounced verification function
  const verifySmartCard = useCallback(
    async (cardNumber: string, network: string) => {
      if (!cardNumber || !network || cardNumber.length < 8) {
        setVerificationStatus('idle');
        setCustomerName('');
        return;
      }

      setVerificationStatus('loading');
      
      try {
        const response = await fetch(
          `https://www.nellobytesystems.com/APIVerifyCableTVV1.0.asp?UserID=CK101257948&APIKey=6GO25FV20CD0M69I7EVOT1HS52DE1U8LHC3K8KP8ZD66PMN6D5S904783QZ22984&CableTV=${network.toLowerCase()}&SmartCardNo=${cardNumber}`
        );
        
        const result = await response.json();
        
        if (result.status === "00" && result.customer_name) {
          setVerificationStatus('success');
          setCustomerName(result.customer_name);
        } else {
          setVerificationStatus('error');
          setCustomerName('');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setVerificationStatus('error');
        setCustomerName('');
      }
    },
    []
  );

  // Debounce the verification call
  useEffect(() => {
    const timer = setTimeout(() => {
      if (smartCardNumber && selectedNetwork) {
        verifySmartCard(smartCardNumber, selectedNetwork);
      }
    }, 1000); // 1 second delay

    return () => clearTimeout(timer);
  }, [smartCardNumber, selectedNetwork, verifySmartCard]);

  const handleNext = () => {
    if (!selectedNetwork || !smartCardNumber || !selectedPlan || verificationStatus !== 'success') {
      return;
    }

    navigate('/cable/review', {
      state: {
        selectedNetwork,
        selectedPlan,
        smartCardNumber,
        customerName
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">Cable</h1>
        
        <Button
          variant="ghost"
          onClick={handleHistoryClick}
          className="text-sm font-medium text-foreground hover:text-primary no-focus-active"
        >
          History
        </Button>
      </header>

      {/* Form Content */}
      <div className="p-6 space-y-8">
        {/* Cable Networks */}
        <div className="grid grid-cols-3 gap-4">
          {cableNetworks.map((network) => (
            <div
              key={network.value}
              onClick={() => handleNetworkSelect(network.value)}
              className="flex flex-col items-center cursor-pointer"
            >
              <div className={`w-16 h-16 rounded-2xl overflow-hidden ${
                selectedNetwork === network.value ? 'ring-4 ring-primary' : ''
              }`}>
                <img 
                  src={network.logo} 
                  alt={network.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Cable Plan */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handlePlanSelect}
            disabled={!selectedNetwork}
            className="w-full h-16 text-left justify-start text-base hover:bg-background active:bg-background focus:bg-background hover:text-foreground active:text-foreground focus:text-foreground hover:border-border active:border-border focus:border-border focus:outline-none focus:ring-0 focus:ring-offset-0 active:scale-100 focus-visible:ring-0 focus-visible:ring-offset-0 transition-none"
          >
            <span className={selectedPlan ? "text-foreground" : "text-muted-foreground"}>
              {selectedPlan ? selectedPlan.description : "Cable Plan"}
            </span>
          </Button>
        </div>

        {/* Smart Card Number */}
        <div className="space-y-3">
          <div className="relative">
            <Input
              id="smartCard"
              type="text"
              value={smartCardNumber}
              onChange={(e) => setSmartCardNumber(e.target.value)}
              placeholder="Smart Card Number/Decoder Number"
              className="h-14 text-base pr-12 focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-input focus-visible:ring-0 focus-visible:ring-offset-0"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBeneficiaryClick}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-primary no-focus-active"
            >
              <Contact className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Verification Status */}
          {smartCardNumber && selectedNetwork && (
            <div className="flex items-center space-x-2">
              {verificationStatus === 'loading' && (
                <>
                  <Loader className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Verifying...</span>
                </>
              )}
              {verificationStatus === 'success' && (
                <>
                  <div className="flex items-center space-x-1 bg-green-50 px-2 py-1 rounded-full">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-700 font-medium">Verified</span>
                  </div>
                  <span className="text-sm text-foreground font-medium">{customerName}</span>
                </>
              )}
              {verificationStatus === 'error' && (
                <>
                  <div className="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
                    <X className="h-4 w-4 text-red-600" />
                    <span className="text-xs text-red-700 font-medium">Invalid</span>
                  </div>
                  <span className="text-sm text-red-600">User account invalid</span>
                </>
              )}
            </div>
          )}
        </div>


        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={!selectedNetwork || !smartCardNumber || !selectedPlan || verificationStatus !== 'success'}
          className="w-full h-14 text-lg font-semibold mt-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default CablePage;