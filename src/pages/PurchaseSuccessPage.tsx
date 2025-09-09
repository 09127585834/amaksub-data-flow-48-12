import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const PurchaseSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [copiedItems, setCopiedItems] = useState<{[key: string]: boolean}>({});
  
  const { 
    transaction, 
    amount, 
    mobileNumber, 
    selectedNetwork, 
    transactionType, 
    quantity, 
    nameOnCard, 
    pins, 
    selectedPlan, 
    selectedPlanType,
    // Electricity specific props
    meterNumber,
    customerName,
    customerAddress,
    selectedBiller,
    phoneNumber,
    token,
    orderId,
    newBalance
  } = location.state || {};

  const isRechargeCard = transactionType === 'recharge-card';
  const isDataBundle = transactionType === 'data-bundle';
  const isElectricity = transactionType === 'electricity';

  // Play success sound and save beneficiary data on component mount
  useEffect(() => {
    const playSuccessSound = () => {
      try {
        const audio = new Audio('/sounds/success.mp3');
        audio.volume = 0.5;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Failed to play success sound:', error);
      }
    };

    const saveBeneficiaryData = async () => {
      if (isDataBundle && user && mobileNumber && selectedNetwork) {
        try {
          const { error } = await supabase
            .from('data_bundle_beneficiaries')
            .upsert({
              user_id: user.id,
              mobile_number: mobileNumber,
              mobile_network: selectedNetwork.toLowerCase(),
              network_name: selectedNetwork
            }, {
              onConflict: 'user_id,mobile_number,mobile_network'
            });

          if (error) {
            console.error('Error saving data bundle beneficiary:', error);
          }
        } catch (error) {
          console.error('Error saving data bundle beneficiary:', error);
        }
      }
    };

    playSuccessSound();
    saveBeneficiaryData();
  }, [isDataBundle, user, mobileNumber, selectedNetwork]);

  const copyToClipboard = async (text: string, type: string, cardIndex?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      const key = cardIndex !== undefined ? `${cardIndex}-${type}` : type;
      setCopiedItems(prev => ({ ...prev, [key]: true }));
      
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });

      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Unable to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  const handlePrintCards = () => {
    navigate('/print-cards', {
      state: {
        transaction,
        amount,
        selectedNetwork,
        quantity,
        nameOnCard,
        pins
      }
    });
  };

  const handleGenerateReceipt = () => {
    navigate('/receipt', {
      state: {
        transaction,
        amount,
        mobileNumber,
        selectedNetwork,
        transactionType,
        quantity,
        nameOnCard,
        pins,
        selectedPlan,
        selectedPlanType,
        // Electricity specific data
        meterNumber,
        customerName,
        customerAddress,
        selectedBiller,
        phoneNumber,
        token,
        orderId
      }
    });
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-sm w-full">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Purchase Successful!</h1>
          <p className="text-muted-foreground">
            Your {isRechargeCard ? 'recharge card' : isDataBundle ? 'data bundle' : isElectricity ? 'electricity bill' : 'airtime'} purchase has been completed successfully.
          </p>
        </div>

        {/* Transaction Details */}
        <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Amount:</span>
            <span className="font-semibold text-foreground">₦{amount}</span>
          </div>
          {isRechargeCard ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Quantity:</span>
                <span className="font-semibold text-foreground">{quantity} cards</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Name on Card:</span>
                <span className="font-semibold text-foreground">{nameOnCard}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold text-foreground capitalize">{selectedNetwork}</span>
              </div>
            </>
          ) : isDataBundle ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile Number:</span>
                <span className="font-semibold text-foreground">{mobileNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold text-foreground capitalize">{selectedNetwork}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Data Size:</span>
                <span className="font-semibold text-foreground">{selectedPlan?.size}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Plan Type:</span>
                <span className="font-semibold text-foreground">{selectedPlanType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Validity:</span>
                <span className="font-semibold text-foreground">{selectedPlan?.validity}</span>
              </div>
            </>
          ) : isElectricity ? (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Biller:</span>
                <span className="font-semibold text-foreground">{selectedBiller}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Meter Number:</span>
                <span className="font-semibold text-foreground">{meterNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Customer Name:</span>
                <span className="font-semibold text-foreground">{customerName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Phone Number:</span>
                <span className="font-semibold text-foreground">{phoneNumber}</span>
              </div>
              {customerAddress && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Address:</span>
                  <span className="font-semibold text-foreground text-sm">{customerAddress}</span>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Mobile Number:</span>
                <span className="font-semibold text-foreground">{mobileNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-semibold text-foreground capitalize">{selectedNetwork}</span>
              </div>
            </>
          )}
          {(transaction?.order_id || orderId) && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Order ID:</span>
              <span className="font-semibold text-foreground text-sm">{transaction?.order_id || orderId}</span>
            </div>
          )}
        </div>

        {/* PIN and SN Details for Recharge Cards */}
        {isRechargeCard && pins && pins.length > 0 && (
          <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
            <h3 className="font-semibold text-foreground text-center">Recharge Card Details</h3>
            {pins.map((pinData: any, index: number) => (
              <div key={index} className="bg-muted/20 rounded-lg p-3 space-y-2 border border-border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Card {index + 1}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">PIN</span>
                      <span className="font-mono text-lg font-bold break-all text-foreground">{pinData.pin}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pinData.pin, 'PIN', index)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedItems[`${index}-PIN`] ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Serial Number</span>
                      <span className="font-mono text-sm font-semibold break-all text-foreground">{pinData.sn}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(pinData.sn, 'Serial Number', index)}
                      className="h-8 w-8 p-0"
                    >
                      {copiedItems[`${index}-Serial Number`] ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Electricity Token */}
        {isElectricity && token && (
          <div className="bg-card rounded-lg p-4 space-y-3 border border-border">
            <h3 className="font-semibold text-foreground text-center">Electricity Token</h3>
            <div className="bg-muted/20 rounded-lg p-3 border border-border">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Token</span>
                  <span className="font-mono text-lg font-bold break-all text-foreground">{token}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(token, 'Token')}
                  className="h-8 w-8 p-0"
                >
                  {copiedItems['Token'] ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="h-14 text-lg font-semibold no-focus-active"
          >
            Go Back
          </Button>
          {isRechargeCard ? (
            <Button 
              onClick={handlePrintCards}
              className="h-14 text-lg font-semibold no-focus-active"
            >
              Print Cards
            </Button>
          ) : (
            <Button 
              onClick={handleGenerateReceipt}
              variant="outline"
              className="h-14 text-lg font-semibold no-focus-active"
            >
              Generate Receipt
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseSuccessPage;