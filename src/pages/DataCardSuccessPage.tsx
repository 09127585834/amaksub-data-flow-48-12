import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Copy, CheckCircle, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DataCardSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { 
    selectedNetwork,
    quantity,
    cardName,
    totalAmount,
    pin,
    serial,
    validity,
    planSize
  } = location.state || {};

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handlePrintCard = () => {
    navigate('/data-card-receipt', {
      state: {
        selectedNetwork,
        quantity,
        cardName,
        totalAmount,
        pin,
        serial,
        validity,
        planSize
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="p-4">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <CheckCircle className="h-20 w-20 text-green-500" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-center text-foreground mb-2">
          Data Card Purchase Successful!
        </h1>
        <p className="text-center text-muted-foreground mb-8">
          Your data card has been processed successfully
        </p>

        {/* Transaction Details */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Network:</span>
            <span className="text-sm text-foreground">{selectedNetwork}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Plan:</span>
            <span className="text-sm text-foreground">{planSize}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Validity:</span>
            <span className="text-sm text-foreground">{validity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Quantity:</span>
            <span className="text-sm text-foreground">{quantity}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Card Name:</span>
            <span className="text-sm text-foreground">{cardName}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Total Amount:</span>
            <span className="text-sm font-bold text-foreground">₦{totalAmount?.toLocaleString()}</span>
          </div>
        </div>

        {/* PIN and Serial Numbers */}
        <div className="space-y-4 mb-8">
          {/* PIN */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">PIN:</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(pin, 'PIN')}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm font-mono text-foreground break-all">{pin}</p>
          </div>

          {/* Serial Number */}
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Serial Number:</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(serial, 'Serial Number')}
                className="h-8 w-8"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm font-mono text-foreground break-all">{serial}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleGoBack}
            variant="outline"
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={handlePrintCard}
            className="w-full h-14 text-lg font-semibold"
            size="lg"
          >
            <Printer className="h-5 w-5 mr-2" />
            Print Card
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataCardSuccessPage;