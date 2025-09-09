import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Contact, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';

const DataBundlePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<string | null>(null);
  const [mobileNumberError, setMobileNumberError] = useState('');
  const [dataPlans, setDataPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  

  const networks = [
    { name: 'MTN', logo: mtnLogo, color: 'bg-yellow-400' },
    { name: 'Airtel', logo: airtelLogo, color: 'bg-red-500' },
    { name: 'Glo', logo: gloLogo, color: 'bg-green-500' },
    { name: '9mobile', logo: nineMobileLogo, color: 'bg-green-600' },
  ];

  // Nigerian network prefixes
  const networkPrefixes = {
    MTN: ['0803', '0806', '0703', '0706', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916', '07025', '07026', '0704'],
    Glo: ['0805', '0807', '0705', '0811', '0815', '0905', '0915'],
    Airtel: ['0802', '0808', '0708', '0812', '0701', '0902', '0907', '0901', '0912'],
    '9mobile': ['0809', '0817', '0818', '0909', '0908']
  };

  // Data plan types for each network
  const dataPlanTypes = {
    MTN: ['SME', 'GIFTING', 'GIFTING PROMO', 'CORPORATE GIFTING'],
    Airtel: ['SME', 'GIFTING PROMO'],
    Glo: ['SME', 'GIFTING PROMO', 'CORPORATE GIFTING'],
    '9mobile': ['SME', 'GIFTING PROMO']
  };

  // Persistent data fetching with retry logic
  const fetchDataPlans = async (network: string, planType: string, retryCount = 0) => {
    const maxRetries = 50; // Keep trying for a long time
    const retryDelay = 2000; // 2 seconds between retries
    
    const tableMap: { [key: string]: string } = {
      'MTN-SME': 'MTN SME',
      'MTN-GIFTING': 'MTN GIFTING', 
      'MTN-GIFTING PROMO': 'MTN GIFTING PROMO',
      'MTN-CORPORATE GIFTING': 'MTN COOPORATE GIFTING',
      'Airtel-SME': 'AIRTEL SME',
      'Airtel-GIFTING PROMO': 'AIRTEL GIFTING PROMO',
      'Glo-GIFTING PROMO': 'GLO GIFTING PROMO',
      'Glo-CORPORATE GIFTING': 'GLO COOPORATE GIFTING',
      '9mobile-SME': '9 MOBILE SME',
      '9mobile-CORPORATE GIFTING': '9 Mobile COOPORATE GIFTING'
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

  const detectNetwork = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    for (const [network, prefixes] of Object.entries(networkPrefixes)) {
      for (const prefix of prefixes) {
        if (cleanNumber.startsWith(prefix)) {
          return network;
        }
      }
    }
    return null;
  };

  useEffect(() => {
    const detected = detectNetwork(mobileNumber);
    setSelectedNetwork(detected);
    setSelectedPlanType(null); // Reset plan type when network changes
  }, [mobileNumber]);


  // Handle selected phone number from contacts and restore form data
  useEffect(() => {
    const selectedPhone = location.state?.selectedPhoneNumber;
    if (selectedPhone) {
      setMobileNumber(selectedPhone);
      // Clear the state after using it
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Handle beneficiary selection
    if (location.state?.selectedBeneficiary) {
      const { mobileNumber, selectedNetwork } = location.state.selectedBeneficiary;
      setMobileNumber(mobileNumber);
      setSelectedNetwork(selectedNetwork);
      // Clear the state to prevent repeated auto-filling
      navigate(location.pathname, { replace: true, state: {} });
    }

    // Restore form data when returning from review/transaction pin pages
    if (location.state?.formData) {
      const { mobileNumber, selectedNetwork, selectedPlanType } = location.state.formData;
      setMobileNumber(mobileNumber || '');
      setSelectedNetwork(selectedNetwork || null);
      setSelectedPlanType(selectedPlanType || null);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 11) {
      setMobileNumber(value);
      setMobileNumberError(''); // Clear error when user types
    }
  };

  const openBeneficiary = () => {
    navigate('/beneficiary', { state: { returnPath: '/data-bundle', serviceType: 'data' } });
  };

  const openContacts = () => {
    // Try to get contacts using Median PWA plugin
    if ((window as any).median && (window as any).median.contacts) {
      (window as any).median.contacts.getAll((contacts: any) => {
        navigate('/contacts', { 
          state: { 
            contacts: contacts || [], 
            returnPath: '/data-bundle' 
          }
        });
      });
    } else {
      toast({
        title: "Contacts Access",
        description: "Please ensure contact permissions are enabled in your app settings.",
        variant: "destructive",
      });
    }
  };

  const handlePlanTypeSelect = (planType: string) => {
    setSelectedPlanType(planType);
    if (selectedNetwork) {
      setIsLoading(true);
      setDataPlans([]);
      fetchDataPlans(selectedNetwork, planType);
    }
  };

  const handleNetworkSelect = (networkName: string) => {
    setSelectedNetwork(networkName);
    setSelectedPlanType(null); // Reset plan type when network changes manually
  };

  const getAvailablePlans = () => {
    return dataPlans;
  };

  const shouldShowComingSoon = () => {
    return selectedPlanType && 
           !((selectedNetwork === 'Airtel' && selectedPlanType === 'SME') || 
             (selectedNetwork === 'Airtel' && selectedPlanType === 'GIFTING PROMO') ||
             (selectedNetwork === 'MTN' && selectedPlanType === 'SME') ||
             (selectedNetwork === 'MTN' && selectedPlanType === 'GIFTING') ||
             (selectedNetwork === 'MTN' && selectedPlanType === 'GIFTING PROMO') ||
             (selectedNetwork === 'MTN' && selectedPlanType === 'CORPORATE GIFTING') ||
             (selectedNetwork === 'Glo' && selectedPlanType === 'SME') ||
             (selectedNetwork === 'Glo' && selectedPlanType === 'GIFTING PROMO') ||
             (selectedNetwork === 'Glo' && selectedPlanType === 'CORPORATE GIFTING') ||
             (selectedNetwork === '9mobile' && selectedPlanType === 'SME') ||
             (selectedNetwork === '9mobile' && selectedPlanType === 'GIFTING PROMO'));
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
        <h1 className="text-lg font-semibold text-foreground">Data Bundle</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 no-focus-active">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-border shadow-lg z-50">
            <DropdownMenuItem 
              onClick={() => navigate('/data-bundle-history')}
              className="cursor-pointer hover:bg-muted"
            >
              History
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => navigate('/sort-code-inquiry')}
              className="cursor-pointer hover:bg-muted"
            >
              Sort code Inquiry
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="p-4">
        {/* Network Icons */}
        <div className="grid grid-cols-4 gap-4 mb-6">
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
          {/* Mobile Number */}
          <div>
            <div className="relative">
              <Input
                type="tel"
                value={mobileNumber}
                onChange={handleMobileNumberChange}
                placeholder="Mobile Number"
                className="pr-12 h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={openBeneficiary}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 no-focus-active"
              >
                <Contact className="h-5 w-5" />
              </Button>
            </div>
            {mobileNumberError && (
              <p className="text-sm text-destructive mt-1">{mobileNumberError}</p>
            )}
          </div>

          {/* Data Plan Types */}
          {selectedNetwork && (
            <div>
              <div className={`flex gap-2 overflow-x-auto pb-2 mb-4 ${
                (selectedNetwork === 'Airtel' || selectedNetwork === '9mobile') 
                  ? 'justify-center' 
                  : ''
              }`}>
                {dataPlanTypes[selectedNetwork as keyof typeof dataPlanTypes]?.map((planType) => (
                  <div
                    key={planType}
                    onClick={() => handlePlanTypeSelect(planType)}
                    className={`px-4 py-2 rounded-full border-2 text-center cursor-pointer transition-colors flex-shrink-0 ${
                      selectedPlanType === planType 
                        ? 'bg-primary text-white border-primary' 
                        : 'bg-white border-primary text-primary hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xs font-medium whitespace-nowrap">{planType}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Plans List */}
          {selectedPlanType && (
            <div className="px-4">
              <div className="space-y-3">
                {isLoading ? (
                  <LoadingSkeleton count={5} />
                ) : shouldShowComingSoon() ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Coming Soon</h3>
                      <p className="text-sm text-gray-500">This service will be available soon.</p>
                    </div>
                  </div>
                ) : (
                  getAvailablePlans().map((plan, index) => (
                    <div 
                      key={index}
                      className="bg-transparent border-2 border-primary rounded-2xl p-4 cursor-pointer transition-colors"
                      onClick={() => {
                        if (!mobileNumber || mobileNumber.length !== 11) {
                          setMobileNumberError("Mobile number must be exactly 11 digits.");
                          return;
                        }
                        
                        // Navigate to review page with plan details
                        navigate('/data-bundle/review', {
                          state: {
                            selectedNetwork,
                            selectedPlanType,
                            selectedPlan: plan,
                            mobileNumber
                          }
                        });
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <h3 className="text-lg font-semibold text-foreground">{plan.size}</h3>
                          <p className="text-sm font-bold text-primary">{selectedPlanType}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-foreground">{formatPrice(plan.price)}</p>
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
    </div>
  );
};

export default DataBundlePage;