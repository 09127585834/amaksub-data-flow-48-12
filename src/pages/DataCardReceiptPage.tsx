import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const DataCardReceiptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
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

  const handleDownload = async () => {
    const element = document.getElementById('data-card-receipt');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        height: element.scrollHeight,
        width: element.scrollWidth,
      });

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`data-card-receipt-${Date.now()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
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
        <h1 className="text-lg font-semibold text-foreground">Data Card Receipt</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDownload}
          className="h-10 w-10"
        >
          <Download className="h-5 w-5" />
        </Button>
      </header>

      {/* Receipt Content */}
      <div className="p-4">
        <div id="data-card-receipt" className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">AMAKSUB DATA</h2>
            <p className="text-sm text-gray-600">Data Card Receipt</p>
            <p className="text-xs text-gray-500">{new Date().toLocaleString()}</p>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Network:</span>
              <span className="text-sm text-gray-800">{selectedNetwork}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Plan:</span>
              <span className="text-sm text-gray-800">{planSize}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Validity:</span>
              <span className="text-sm text-gray-800">{validity}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Quantity:</span>
              <span className="text-sm text-gray-800">{quantity}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Card Name:</span>
              <span className="text-sm text-gray-800">{cardName}</span>
            </div>

            <div className="flex justify-between border-t pt-2">
              <span className="text-sm font-bold text-gray-700">Total Amount:</span>
              <span className="text-sm font-bold text-gray-800">₦{totalAmount?.toLocaleString()}</span>
            </div>
          </div>

          {/* PIN and Serial */}
          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">PIN:</p>
              <p className="text-sm font-mono text-gray-800 break-all">{pin}</p>
            </div>

            <div className="bg-gray-50 p-3 rounded">
              <p className="text-xs font-medium text-gray-700 mb-1">Serial Number:</p>
              <p className="text-sm font-mono text-gray-800 break-all">{serial}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t pt-4">
            <p className="text-xs text-gray-500">Thank you for using Amaksub Data</p>
            <p className="text-xs text-gray-500">www.amaksub.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataCardReceiptPage;