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

const AirtimePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [mobileNumber, setMobileNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [mobileNumberError, setMobileNumberError] = useState('');

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
      const { mobileNumber, amount, selectedNetwork } = location.state.formData;
      setMobileNumber(mobileNumber || '');
      setAmount(amount || '');
      setSelectedNetwork(selectedNetwork || null);
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAmount(e.target.value);
  };

  const handlePurchase = () => {
    if (!mobileNumber || !amount || !selectedNetwork) {
      return;
    }

    if (mobileNumber.length !== 11) {
      setMobileNumberError("Mobile number must be exactly 11 digits.");
      return;
    }
    
    navigate('/airtime/review', {
      state: {
        mobileNumber,
        amount,
        selectedNetwork
      }
    });
  };

  const openBeneficiary = () => {
    navigate('/beneficiary', { state: { returnPath: '/airtime', serviceType: 'airtime' } });
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
        <h1 className="text-lg font-semibold text-foreground">Airtime Top Up</h1>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 no-focus-active">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background border-border shadow-lg z-50">
            <DropdownMenuItem 
              onClick={() => navigate('/airtime-history')}
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
            <div key={network.name} className="flex flex-col items-center space-y-2">
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

          {/* Amount */}
          <div>
            <Input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
          </div>

          {/* Purchase Button */}
          <Button 
            onClick={handlePurchase}
            className="w-full h-14 text-lg font-semibold mt-8"
            size="lg"
          >
            Purchase
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AirtimePage;