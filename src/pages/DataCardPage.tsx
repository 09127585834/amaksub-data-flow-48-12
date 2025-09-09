import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Contact } from 'lucide-react';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const DataCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState('');
  const [cardName, setCardName] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [quantityError, setQuantityError] = useState('');
  const [cardNameError, setCardNameError] = useState('');
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const networks = [
    { name: 'MTN', logo: mtnLogo, color: 'bg-yellow-400' },
    { name: 'Airtel', logo: airtelLogo, color: 'bg-red-500' },
    { name: 'Glo', logo: gloLogo, color: 'bg-green-500' },
  ];

  // Data plan types for each network
  const dataPlanTypes = {
    MTN: ['SME'],
    Airtel: ['CORPORATE GIFTING'],
    Glo: ['CORPORATE GIFTING']
  };

  // Persistent data fetching with silent retry logic - no toast notifications
  const fetchDataPlans = async (network: string, planType: string, retryCount = 0) => {
    const maxRetries = 50; // Keep trying for a long time
    const retryDelay = 2000; // 2 seconds between retries
    
    const tableMap: { [key: string]: string } = {
      'MTN-SME': 'MTN DATA CARD SME',
      'Airtel-CORPORATE GIFTING': 'AIRTEL DATA CARD COOPORATE GIFTING',
      'Glo-CORPORATE GIFTING': 'GLO COOPORATE GIFTING'
    };
    
    const tableKey = `${network}-${planType}`;
    const tableName = tableMap[tableKey];
    
    if (!tableName) {
      setDataPlans([]);
      setIsLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from(tableName as any)
        .select('*')
        .order('price', { ascending: true });
      
      if (error) throw error;
      
      setDataPlans(data || []);
      setIsLoading(false);
    } catch (error) {
      console.log(`Fetch attempt ${retryCount + 1} failed, retrying...`);
      
      // Silent retry - no toast notifications
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchDataPlans(network, planType, retryCount + 1);
        }, retryDelay);
      } else {
        setDataPlans([]);
        setIsLoading(false);
      }
    }
  };

  // Restore form data when returning from review/transaction pin pages
  useEffect(() => {
    if (location.state?.formData) {
      const { selectedNetwork, quantity, cardName, selectedPlanType } = location.state.formData;
      setSelectedNetwork(selectedNetwork || null);
      setQuantity(quantity || '');
      setCardName(cardName || '');
      setSelectedPlanType(selectedPlanType || null);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleNetworkSelect = (networkName: string) => {
    setSelectedNetwork(networkName);
    setSelectedPlanType(null); // Reset plan type when network changes
  };

  const handlePlanTypeSelect = (planType: string) => {
    setSelectedPlanType(planType);
    if (selectedNetwork) {
      setIsLoading(true);
      setDataPlans([]);
      fetchDataPlans(selectedNetwork, planType);
    }
  };

  const getAvailablePlans = () => {
    return dataPlans;
  };

  const handlePlanSelect = (plan: any) => {
    let hasErrors = false;
    
    if (!quantity) {
      setQuantityError("Quantity is required");
      hasErrors = true;
    }
    
    if (!cardName.trim()) {
      setCardNameError("Card name is required");
      hasErrors = true;
    }
    
    if (hasErrors) {
      return;
    }
    
    navigate('/data-card/review', {
      state: {
        selectedNetwork,
        selectedPlanType,
        selectedPlan: plan,
        quantity,
        cardName
      }
    });
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Data Card</h1>
        <Button 
          variant="ghost" 
          onClick={() => navigate('/data-card-history')}
          className="text-foreground font-medium"
        >
          History
        </Button>
      </header>

      <div className="p-4">
        {/* Network Icons */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {networks.map((network) => (
            <div 
              key={network.name} 
              className="flex flex-col items-center space-y-2 cursor-pointer"
              onClick={() => handleNetworkSelect(network.name)}
            >
              <div className={`w-16 h-16 rounded-full overflow-hidden ${selectedNetwork === network.name ? 'ring-4 ring-primary' : ''}`}>
                <img 
                  src={network.logo} 
                  alt={network.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-medium text-foreground">{network.name}</span>
            </div>
          ))}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Quantity */}
          <div>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => {
                setQuantity(e.target.value);
                setQuantityError(''); // Clear error when user types
              }}
              placeholder="Quantity"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
            {quantityError && (
              <p className="text-sm text-destructive mt-1">{quantityError}</p>
            )}
          </div>

          {/* Card Name */}
          <div>
            <Input
              type="text"
              value={cardName}
              onChange={(e) => {
                setCardName(e.target.value);
                setCardNameError(''); // Clear error when user types
              }}
              placeholder="Card Name"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
            {cardNameError && (
              <p className="text-sm text-destructive mt-1">{cardNameError}</p>
            )}
          </div>

          {/* Data Plan Types */}
          {selectedNetwork && (
            <div>
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4 justify-center">
                {dataPlanTypes[selectedNetwork as keyof typeof dataPlanTypes]?.map((planType) => (
                  <div
                    key={planType}
                    onClick={() => handlePlanTypeSelect(planType)}
                    className={`px-4 py-2 rounded-full border-2 text-center cursor-pointer transition-colors flex-shrink-0 ${
                      selectedPlanType === planType ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-background text-foreground hover:border-primary'
                    }`}
                  >
                    <span className="text-sm font-medium">{planType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Data Plans */}
        {selectedPlanType && (
          <div className="mt-6">
            <div className="flex flex-col items-center space-y-4 px-4">
              {isLoading ? (
                <div className="space-y-4 w-full">
                  {[...Array(5)].map((_, index) => (
                    <div key={index} className="bg-card rounded-lg p-4 animate-pulse border border-border/20">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                getAvailablePlans().map((plan, index) => (
                  <div
                    key={index}
                    onClick={() => handlePlanSelect(plan)}
                    className="w-full p-4 border-2 border-primary rounded-3xl cursor-pointer bg-card"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-foreground text-lg">{plan.size}</h3>
                        <p className="text-sm text-primary font-medium">{selectedPlanType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-lg">{formatPrice(plan.price)}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataCardPage;