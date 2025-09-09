import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ArrowLeft } from 'lucide-react';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';
import { useToast } from '@/hooks/use-toast';

const RechargeCardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [nameOnCard, setNameOnCard] = useState('Amaksub Data');
  const [selectedNetwork, setSelectedNetwork] = useState<string | null>(null);
  const [showAmountError, setShowAmountError] = useState(false);
  const [showQuantityError, setShowQuantityError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Restore form data when returning from review/transaction pin pages
  useEffect(() => {
    if (location.state?.formData) {
      const { selectedNetwork, amount, quantity, nameOnCard } = location.state.formData;
      setSelectedNetwork(selectedNetwork || null);
      setAmount(amount || '');
      setQuantity(quantity || '');
      setNameOnCard(nameOnCard || 'Amaksub Data');
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  const networks = [
    { name: 'MTN', logo: mtnLogo, color: 'bg-yellow-400' },
    { name: 'Airtel', logo: airtelLogo, color: 'bg-red-500' },
    { name: 'Glo', logo: gloLogo, color: 'bg-green-500' },
    { name: '9mobile', logo: nineMobileLogo, color: 'bg-green-600' },
  ];

  const validAmounts = ['100', '200', '400', '500'];

  const getCashback = (selectedNetwork: string) => {
    if (selectedNetwork === 'MTN') {
      return '₦1.5';
    } else if (['Glo', 'Airtel', '9mobile'].includes(selectedNetwork)) {
      return '₦1.7';
    }
    return '';
  };

  const handleNetworkSelect = (networkName: string) => {
    setSelectedNetwork(networkName);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or numeric values
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value);
      
      // Real-time validation for amount
      if (value !== '' && !validAmounts.includes(value)) {
        setErrorMessage('Invalid amount. Please enter 100, 200, 400, or 500.');
        setShowAmountError(true);
      } else {
        setShowAmountError(false);
      }
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty input or numeric values
    if (value === '' || /^\d+$/.test(value)) {
      setQuantity(value);
      
      // Real-time validation for quantity (1-500)
      const numQuantity = parseInt(value);
      if (value !== '' && (isNaN(numQuantity) || numQuantity < 1 || numQuantity > 500)) {
        setErrorMessage('Invalid quantity. Please enter a quantity between 1 and 500.');
        setShowQuantityError(true);
      } else {
        setShowQuantityError(false);
      }
    }
  };

  const handlePrint = () => {
    // Check if there are any validation errors
    if (showAmountError || showQuantityError) {
      return; // Don't proceed if there are validation errors
    }

    if (!selectedNetwork || !amount || !quantity || !nameOnCard.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    navigate('/recharge-card/review', {
      state: {
        selectedNetwork,
        amount,
        quantity,
        nameOnCard,
        cashback: getCashback(selectedNetwork)
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
          onClick={() => navigate('/dashboard')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Recharge Card</h1>
        <div 
          onClick={() => navigate('/print-recharge-history')}
          className="text-base font-semibold text-primary cursor-pointer hover:text-primary/80 transition-colors px-2 py-1 rounded"
        >
          History
        </div>
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
          {/* Amount */}
          <div>
            <Input
              type="text"
              value={amount}
              onChange={handleAmountChange}
              placeholder="Amount"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
            {selectedNetwork && amount && validAmounts.includes(amount) && (
              <div className="mt-2">
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  {getCashback(selectedNetwork)} Cashback
                </span>
              </div>
            )}
          </div>

          {/* Quantity */}
          <div>
            <Input
              type="number"
              value={quantity}
              onChange={handleQuantityChange}
              placeholder="Quantity"
              min="1"
              max="500"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
          </div>

          {/* Name On Card */}
          <div>
            <Input
              type="text"
              value={nameOnCard}
              onChange={(e) => setNameOnCard(e.target.value)}
              placeholder="Card Name"
              className="h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
          </div>

          {/* Print Button */}
          <Button 
            onClick={handlePrint}
            disabled={showAmountError || showQuantityError || !selectedNetwork || !amount || !quantity || !nameOnCard.trim()}
            className="w-full h-14 text-lg font-semibold mt-8"
            size="lg"
          >
            Print
          </Button>
        </div>
      </div>

      {/* Amount Error Dialog */}
      <AlertDialog open={showAmountError} onOpenChange={setShowAmountError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Amount</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowAmountError(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quantity Error Dialog */}
      <AlertDialog open={showQuantityError} onOpenChange={setShowQuantityError}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid Quantity</AlertDialogTitle>
            <AlertDialogDescription>
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowQuantityError(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RechargeCardPage;