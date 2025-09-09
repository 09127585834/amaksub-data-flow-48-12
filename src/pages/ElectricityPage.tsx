import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ChevronDown, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ElectricityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [selectedBiller, setSelectedBiller] = useState('');
  const [selectedBillerCode, setSelectedBillerCode] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    customerName?: string;
    errorMessage?: string;
  } | null>(null);

  // Handle returning from biller select page OR review/transaction pin pages
  useEffect(() => {
    if (location.state?.returnedBiller) {
      setSelectedBiller(location.state.returnedBiller.name);
      setSelectedBillerCode(location.state.returnedBiller.code);
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
    
    // Restore form data when returning from review/transaction pin pages
    if (location.state?.formData) {
      const { selectedBiller, selectedBillerCode, paymentType, meterNumber, phoneNumber, amount, validationResult } = location.state.formData;
      setSelectedBiller(selectedBiller || '');
      setSelectedBillerCode(selectedBillerCode || '');
      setPaymentType(paymentType || '');
      setMeterNumber(meterNumber || '');
      setPhoneNumber(phoneNumber || '');
      setAmount(amount || '');
      if (validationResult) {
        setValidationResult(validationResult);
      }
      // Clear the state to prevent it from persisting
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Validate meter number when user stops typing
  useEffect(() => {
    if (meterNumber && selectedBillerCode && meterNumber.length >= 10) {
      const timeoutId = setTimeout(() => {
        validateMeterNumber();
      }, 1000); // Wait 1 second after user stops typing

      return () => clearTimeout(timeoutId);
    } else {
      setValidationResult(null);
    }
  }, [meterNumber, selectedBillerCode]);

  const validateMeterNumber = async () => {
    if (!meterNumber || !selectedBillerCode) return;

    setIsValidating(true);
    setValidationResult(null);

    try {
      // Add leading zero for single digit company codes (1-9)
      const formattedBillerCode = selectedBillerCode.length === 1 && /^[1-9]$/.test(selectedBillerCode) 
        ? `0${selectedBillerCode}` 
        : selectedBillerCode;
      
      console.log('Validating meter:', meterNumber, 'with biller code:', formattedBillerCode);
      
      const response = await fetch(
        `https://www.nellobytesystems.com/APIVerifyElectricityV1.asp?UserID=CK101257948&APIKey=6GO25FV20CD0M69I7EVOT1HS52DE1U8LHC3K8KP8ZD66PMN6D5S904783QZ22984&ElectricCompany=${selectedBillerCode}&MeterNo=${meterNumber}`
      );
      
      console.log('API Response status:', response.status);
      console.log('API Response headers:', response.headers.get('content-type'));
      
      // First try to get the raw text
      const responseText = await response.text();
      console.log('Raw API Response:', responseText);
      
      // Try to parse as JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON data:', data);
      } catch (parseError) {
        console.error('Failed to parse as JSON:', parseError);
        console.log('Response is not valid JSON, treating as error');
        setValidationResult({
          isValid: false,
          errorMessage: 'Invalid API response format'
        });
        return;
      }
      
      if (data.status === "00" && data.customer_name) {
        console.log('Validation successful:', data.customer_name);
        setValidationResult({
          isValid: true,
          customerName: data.customer_name
        });
      } else {
        console.log('Validation failed:', data);
        setValidationResult({
          isValid: false,
          errorMessage: data.message || 'Invalid meter number'
        });
      }
    } catch (error) {
      console.error('API validation error:', error);
      setValidationResult({
        isValid: false,
        errorMessage: 'Failed to validate meter number'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleBillerSelect = () => {
    console.log('Navigating to biller select page');
    navigate('/electricity/biller-select', { 
      state: { selectedBiller, selectedBillerCode } 
    });
  };

  const handleHistoryClick = () => {
    navigate('/electricity/history');
  };

  const handleNext = () => {
    if (!validationResult?.isValid) {
      toast({
        title: "Invalid Meter Number",
        description: "Please ensure your meter number is verified before proceeding.",
        variant: "destructive"
      });
      return;
    }

    // Check minimum amount
    const minimumAmount = selectedBiller.includes('IBEDC') ? 2000 : 500;
    const enteredAmount = parseFloat(amount);

    if (enteredAmount < minimumAmount) {
      toast({
        title: "Amount Too Low",
        description: `Minimum amount is ₦${minimumAmount.toLocaleString()}`,
        variant: "destructive"
      });
      return;
    }

    navigate('/electricity/review', {
      state: {
        selectedBiller,
        selectedBillerCode,
        paymentType,
        meterNumber,
        phoneNumber,
        customerName: validationResult.customerName,
        amount
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
        
        <h1 className="text-xl font-semibold text-foreground">Electricity</h1>
        
        <div className="w-10" />
      </header>

      {/* Form Content */}
      <div className="p-6 space-y-8">
        {/* Select Biller */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={handleBillerSelect}
            className="w-full h-16 text-left justify-between text-base hover:bg-background active:bg-background focus:bg-background hover:text-foreground active:text-foreground focus:text-foreground hover:border-border active:border-border focus:border-border focus:outline-none focus:ring-0 focus:ring-offset-0 active:scale-100 focus-visible:ring-0 focus-visible:ring-offset-0 transition-none"
          >
            <span>{selectedBiller || "Select Biller"}</span>
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {/* Payment Type Selection */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={paymentType === 'prepaid' ? 'default' : 'outline'}
              onClick={() => setPaymentType('prepaid')}
              className="h-8 text-xs font-medium"
            >
              Prepaid
            </Button>
            <Button
              variant={paymentType === 'postpaid' ? 'default' : 'outline'}
              onClick={() => setPaymentType('postpaid')}
              className="h-8 text-xs font-medium"
            >
              Postpaid
            </Button>
          </div>
        </div>

        {/* Meter Number */}
        <div className="space-y-3">
          <Input
            id="meter"
            type="text"
            value={meterNumber}
            onChange={(e) => setMeterNumber(e.target.value)}
            placeholder="Meter Number"
            className="h-14 text-base focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-input focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          
          {/* Validation Status */}
          {isValidating && (
            <Badge variant="secondary" className="text-xs">
              Verifying Meter Number...
            </Badge>
          )}
          
          {validationResult && (
            <div className="text-sm">
              {validationResult.isValid ? (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <div className="flex items-center justify-center w-5 h-5 bg-green-600 rounded-full">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span>Verified: {validationResult.customerName}</span>
                </div>
              ) : (
                <p className="text-red-600">
                  ✗ {validationResult.errorMessage}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-3">
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Phone Number"
            className="h-14 text-base focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-input focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>

        {/* Amount */}
        <div className="space-y-3">
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            className="h-14 text-base focus:outline-none focus:ring-0 focus:ring-offset-0 focus:border-input focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {selectedBiller && (
            <div className="text-sm text-muted-foreground">
              {selectedBiller.includes('IBEDC') ? 'Minimum Amount: ₦2,000' : 'Minimum Amount: ₦500'}
            </div>
          )}
        </div>

        {/* Next Button */}
        <Button
          onClick={handleNext}
          disabled={
            !selectedBiller || 
            !paymentType || 
            !meterNumber || 
            !phoneNumber || 
            !amount || 
            !validationResult?.isValid ||
            (selectedBiller.includes('IBEDC') && parseFloat(amount) < 2000) ||
            (!selectedBiller.includes('IBEDC') && parseFloat(amount) < 500)
          }
          className="w-full h-14 text-lg font-semibold mt-8"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default ElectricityPage;