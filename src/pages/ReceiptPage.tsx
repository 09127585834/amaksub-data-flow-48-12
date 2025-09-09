import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import mtnLogo from '@/assets/mtn-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';

const ReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { 
    transaction, 
    amount, 
    mobileNumber, 
    selectedNetwork, 
    selectedPlan, 
    selectedPlanType, 
    transactionType,
    // Electricity specific data
    meterNumber,
    customerName,
    customerAddress,
    selectedBiller,
    phoneNumber,
    token
  } = location.state || {};

  const getNetworkLogo = (network: string) => {
    const networkLogos: { [key: string]: string } = {
      'mtn': mtnLogo,
      'glo': gloLogo,
      'airtel': airtelLogo,
      '9mobile': nineMobileLogo
    };
    return networkLogos[network.toLowerCase()] || gloLogo;
  };

  const handleDownloadReceipt = async () => {
    try {
      // Create a canvas element to generate the receipt image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) throw new Error('Canvas not supported');

      // Set canvas size
      canvas.width = 400;
      canvas.height = 600;

      // Fill background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Add header
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('AMAKSUB DATA', canvas.width / 2, 50);
      
      ctx.font = '16px Arial';
      ctx.fillText('Transaction Receipt', canvas.width / 2, 80);

      // Add divider line
      ctx.strokeStyle = '#cccccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 100);
      ctx.lineTo(360, 100);
      ctx.stroke();

      // Add transaction details
      const details = [
        { label: 'Transaction ID:', value: transaction?.order_id || 'N/A' },
        { label: 'Amount:', value: `₦${amount}` },
        ...(transactionType === 'electricity' ? [
          { label: 'Biller:', value: selectedBiller || 'N/A' },
          { label: 'Meter Number:', value: meterNumber || 'N/A' },
          { label: 'Customer Name:', value: customerName || 'N/A' },
          { label: 'Phone Number:', value: phoneNumber || 'N/A' },
          ...(token ? [{ label: 'Token:', value: token }] : [])
        ] : [
          { label: 'Mobile Number:', value: mobileNumber },
          { label: 'Network:', value: selectedNetwork?.toUpperCase() },
          ...(transactionType === 'data-bundle' ? [
            { label: 'Data Size:', value: selectedPlan?.size || 'N/A' },
            { label: 'Plan Type:', value: selectedPlanType || 'N/A' },
            { label: 'Validity:', value: selectedPlan?.validity || 'N/A' }
          ] : [])
        ]),
        { label: 'Status:', value: 'Successful' },
        { label: 'Date:', value: new Date(transaction?.created_at).toLocaleDateString() },
        { label: 'Time:', value: new Date(transaction?.created_at).toLocaleTimeString() }
      ];

      ctx.textAlign = 'left';
      ctx.font = '14px Arial';
      let yPosition = 140;

      details.forEach((detail) => {
        ctx.fillStyle = '#666666';
        ctx.fillText(detail.label, 40, yPosition);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        ctx.fillText(detail.value, 180, yPosition);
        ctx.font = '14px Arial';
        yPosition += 30;
      });

      // Add footer
      yPosition += 40;
      ctx.textAlign = 'center';
      ctx.fillStyle = '#666666';
      ctx.font = '12px Arial';
      ctx.fillText('Thank you for using Amaksub Data', canvas.width / 2, yPosition);
      ctx.fillText('For support, contact us at support@amaksub.com', canvas.width / 2, yPosition + 20);

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (!blob) throw new Error('Failed to generate receipt');

        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `receipt-${transaction?.order_id || Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);

        toast({
          title: "Receipt Downloaded",
          description: "Receipt saved successfully to your device",
        });
      }, 'image/png');

    } catch (error) {
      console.error('Error downloading receipt:', error);
      toast({
        title: "Download Failed",
        description: "Unable to download receipt. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Receipt</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Receipt Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-foreground mb-2">AMAKSUB DATA</h2>
            <p className="text-sm text-muted-foreground">Transaction Receipt</p>
            <div className="w-full h-px bg-border my-4"></div>
          </div>

          {/* Network Logo - Only show for non-electricity transactions */}
          {transactionType !== 'electricity' && (
            <div className="flex justify-center mb-6">
              <img 
                src={getNetworkLogo(selectedNetwork)} 
                alt={`${selectedNetwork} logo`}
                className="w-12 h-12 object-contain rounded-full"
              />
            </div>
          )}

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-semibold text-sm">{transaction?.order_id || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-semibold text-lg">₦{amount?.toLocaleString()}</span>
            </div>
            
            {transactionType === 'electricity' ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Biller:</span>
                  <span className="font-semibold">{selectedBiller}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Meter Number:</span>
                  <span className="font-semibold">{meterNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Customer Name:</span>
                  <span className="font-semibold">{customerName}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Phone Number:</span>
                  <span className="font-semibold">{phoneNumber}</span>
                </div>
                
                {token && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Token:</span>
                    <span className="font-semibold font-mono text-sm break-all">{token}</span>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Mobile Number:</span>
                  <span className="font-semibold">{mobileNumber}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Network:</span>
                  <span className="font-semibold capitalize">{selectedNetwork}</span>
                </div>
                
                {transactionType === 'data-bundle' && selectedPlan && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Data Size:</span>
                      <span className="font-semibold">{selectedPlan.size}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Plan Type:</span>
                      <span className="font-semibold">{selectedPlanType}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Validity:</span>
                      <span className="font-semibold">{selectedPlan.validity}</span>
                    </div>
                  </>
                )}
              </>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Status:</span>
              <span className="font-semibold text-green-600">Successful</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-semibold">{new Date(transaction?.created_at).toLocaleDateString()}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-semibold">{new Date(transaction?.created_at).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Thank you for using Amaksub Data</p>
            <p className="text-xs text-muted-foreground">For support, contact us at support@amaksub.com</p>
          </div>
        </div>

        {/* Download Button */}
        <div className="mt-6">
          <Button 
            onClick={handleDownloadReceipt}
            className="w-full h-14 text-lg font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptPage;