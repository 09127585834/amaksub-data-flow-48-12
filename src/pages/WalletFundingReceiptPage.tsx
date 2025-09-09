import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const WalletFundingReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const { 
    transaction, 
    amount
  } = location.state || {};

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
      ctx.fillText('Wallet Funding Receipt', canvas.width / 2, 80);

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
        { label: 'Amount:', value: `₦${amount?.toLocaleString()}` },
        { label: 'Transaction Type:', value: 'Credited' },
        { label: 'Wallet Type:', value: 'User Wallet' },
        { label: 'Payment Type:', value: 'Automated Bank Transfer' },
        { label: 'Credit By:', value: 'Wema Automated Bank Transfer' },
        { label: 'Fee:', value: '₦0.00' },
        { label: 'Description:', value: 'Account Credit By Automated Bank Transfer' },
        { label: 'Status:', value: 'Successful' },
        { label: 'Date:', value: transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A' },
        { label: 'Time:', value: transaction?.created_at ? new Date(transaction.created_at).toLocaleTimeString() : 'N/A' }
      ];

      ctx.textAlign = 'left';
      ctx.font = '14px Arial';
      let yPosition = 140;

      details.forEach((detail) => {
        ctx.fillStyle = '#666666';
        ctx.fillText(detail.label, 40, yPosition);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px Arial';
        
        // Handle long text for description
        if (detail.label === 'Description:') {
          const words = detail.value.split(' ');
          let line = '';
          let currentY = yPosition;
          
          words.forEach((word) => {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            
            if (metrics.width > 320 && line !== '') {
              ctx.fillText(line, 180, currentY);
              line = word + ' ';
              currentY += 20;
            } else {
              line = testLine;
            }
          });
          
          ctx.fillText(line, 180, currentY);
          yPosition = currentY + 30;
        } else {
          ctx.fillText(detail.value, 180, yPosition);
          yPosition += 30;
        }
        
        ctx.font = '14px Arial';
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
        link.download = `wallet-funding-receipt-${transaction?.order_id || Date.now()}.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);

        toast({
          title: "Receipt Downloaded",
          description: "Wallet funding receipt saved successfully to your device",
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
        <h1 className="text-lg font-semibold text-foreground">Wallet Funding Receipt</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Receipt Container */}
        <div className="bg-white rounded-lg shadow-lg p-6 mx-auto max-w-sm">
          {/* Header with Success Icon */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">AMAKSUB DATA</h2>
            <p className="text-sm text-muted-foreground">Successful</p>
            <p className="text-lg font-semibold text-green-600 mt-2">₦{amount?.toLocaleString()}</p>
            <div className="w-full h-px bg-border my-4"></div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction Type:</span>
              <span className="font-semibold">Credited</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Transaction ID:</span>
              <span className="font-semibold text-sm">{transaction?.order_id || 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Wallet Type:</span>
              <span className="font-semibold">User Wallet</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Payment Type:</span>
              <span className="font-semibold">Automated Bank Transfer</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Credit By:</span>
              <span className="font-semibold">Wema Automated Bank Transfer</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fee:</span>
              <span className="font-semibold">₦0.00</span>
            </div>
            
            <div className="space-y-2">
              <span className="text-muted-foreground">Description:</span>
              <p className="font-semibold text-sm">Account Credit By Automated Bank Transfer</p>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Date:</span>
              <span className="font-semibold">{transaction?.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Time:</span>
              <span className="font-semibold">{transaction?.created_at ? new Date(transaction.created_at).toLocaleTimeString() : 'N/A'}</span>
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

export default WalletFundingReceiptPage;