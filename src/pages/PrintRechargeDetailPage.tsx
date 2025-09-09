import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import mtnLogo from '@/assets/mtn-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';

const PrintRechargeDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  
  const { transaction, amount, selectedNetwork, quantity, nameOnCard, pins } = location.state || {};

  const getNetworkLogo = (network: string) => {
    const networkLogos: { [key: string]: string } = {
      'mtn': mtnLogo,
      'glo': gloLogo,
      'airtel': airtelLogo,
      '9mobile': nineMobileLogo
    };
    return networkLogos[network.toLowerCase()] || gloLogo;
  };

  const handlePrintCards = async () => {
    if (!printRef.current || !pins?.length) {
      toast({
        title: "Error",
        description: "No cards to print",
        variant: "destructive"
      });
      return;
    }

    try {
      const element = printRef.current;
      
      // Create canvas from HTML element
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save PDF
      const fileName = `recharge-cards-${transaction?.order_id || Date.now()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Cards Printed Successfully!",
        description: "PDF has been downloaded to your device",
      });

    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Print Failed",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDateTime = () => {
    return new Date(transaction?.created_at || Date.now()).toLocaleString();
  };

  // Split pins into chunks of 3 for grid layout
  const chunkedPins = pins ? pins.reduce((chunks: any[], pin: any, index: number) => {
    const chunkIndex = Math.floor(index / 3);
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    chunks[chunkIndex].push(pin);
    return chunks;
  }, []) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">Print Cards</h1>
        <div className="w-10" />
      </header>

      <div className="p-4">
        {/* Transaction Info */}
        <div className="mb-6 p-4 bg-card rounded-lg border">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Network:</span>
              <span className="ml-2 font-medium capitalize">{selectedNetwork}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Amount:</span>
              <span className="ml-2 font-medium">₦{amount?.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>
              <span className="ml-2 font-medium">{formatDateTime()}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Cards:</span>
              <span className="ml-2 font-medium">{pins?.length || 0}</span>
            </div>
          </div>
        </div>

        {/* Print Preview */}
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-4">Recharge Cards Preview</h2>
          <div 
            ref={printRef}
            className="bg-white p-6"
            style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              margin: '0 auto',
              fontFamily: 'Arial, sans-serif'
            }}
          >
            {chunkedPins.map((chunk: any[], chunkIndex: number) => (
              <div key={chunkIndex} className="flex justify-center gap-4 mb-6 flex-wrap">
                {chunk.map((pinData: any, cardIndex: number) => {
                  const globalIndex = chunkIndex * 3 + cardIndex;
                  return (
                    <div 
                      key={globalIndex}
                      className="border-2 border-gray-800 rounded-lg p-3 bg-gradient-to-br from-blue-50 to-white flex-shrink-0"
                      style={{ 
                        width: '60mm', 
                        height: '40mm',
                        fontSize: '8px',
                        breakInside: 'avoid'
                      }}
                    >
                      {/* Card Header */}
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1 pr-1">
                          <div className="text-center mb-1">
                            <span className="text-xs font-bold text-gray-700 block truncate">
                              {nameOnCard}
                            </span>
                          </div>
                          <div className="text-left">
                            <span className="text-xs font-bold text-gray-700 block truncate">
                              {nameOnCard}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-center">
                          <div className="text-center mb-1">
                            <span className="text-lg font-bold text-green-700">₦{amount}</span>
                          </div>
                          <img 
                            src={getNetworkLogo(selectedNetwork)} 
                            alt={selectedNetwork}
                            className="w-6 h-6 object-contain"
                          />
                        </div>
                      </div>

                      {/* Card Details */}
                      <div className="space-y-1" style={{ fontSize: '8px', lineHeight: '1.2' }}>
                        <div className="flex flex-wrap">
                          <span className="font-semibold text-gray-600">S/N:</span>
                          <span className="ml-1 font-mono text-gray-800 break-all text-xs">{pinData.sn}</span>
                        </div>
                        
                        <div className="flex flex-wrap">
                          <span className="font-semibold text-gray-600">Pin:</span>
                          <span className="ml-1 font-mono font-bold text-gray-800 text-xs">{pinData.pin}</span>
                        </div>
                        
                        <div className="flex flex-wrap">
                          <span className="font-semibold text-gray-600">Time:</span>
                          <span className="ml-1 text-gray-700 text-xs">{formatDateTime()}</span>
                        </div>
                        
                        <div className="pt-1">
                          <span className="font-semibold text-gray-600 block">How to load:</span>
                          <div className="text-blue-700 font-mono font-bold text-xs">*311*PIN#</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Print Button */}
        <div className="flex justify-center">
          <Button 
            onClick={handlePrintCards}
            className="w-full max-w-md h-14 text-lg font-semibold"
          >
            <Printer className="w-5 h-5 mr-2" />
            Print Cards
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PrintRechargeDetailPage;