import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy } from 'lucide-react';
import mtnLogo from '@/assets/mtn-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';

const SortCodeInquiryPage = () => {
  const navigate = useNavigate();

  const networks = [
    {
      name: 'MTN',
      logo: mtnLogo,
      codes: [
        { label: 'Check Mobile Phone Number', code: '*123*1*1#' },
        { label: 'Checking phone Balance', code: '*310#' },
        { label: 'Check Data usage', code: '*323*1#' }
      ]
    },
    {
      name: 'Airtel',
      logo: airtelLogo,
      codes: [
        { label: 'Check Mobile phone Number', code: '*121*3*4#' },
        { label: 'Check phone Balance', code: '*310#' },
        { label: 'Check Data Usage', code: '*323#' }
      ]
    },
    {
      name: 'Glo',
      logo: gloLogo,
      codes: [
        { label: 'Check Mobile Phone Number', code: '777*#' },
        { label: 'Check Phone Balance', code: '*310#' },
        { label: 'Check Data Usage', code: '*323#' }
      ]
    },
    {
      name: '9mobile',
      logo: nineMobileLogo,
      codes: [
        { label: 'Check Mobile Phone Number', code: '*248#' },
        { label: 'Check Phone Balance', code: '*310#' },
        { label: 'Check Data usage', code: '*323#' }
      ]
    }
  ];

  const copyToClipboard = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      // No toast notification as per user request
    } catch (error) {
      console.error('Failed to copy code:', error);
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
        <h1 className="text-lg font-semibold text-foreground">Sort Code Inquiry</h1>
        <div className="w-10"></div>
      </header>

      <div className="p-4 space-y-6">
        {networks.map((network) => (
          <div key={network.name} className="bg-card border border-border rounded-lg p-4">
            {/* Network Header */}
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden">
                <img 
                  src={network.logo} 
                  alt={network.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-lg font-semibold text-foreground">{network.name}</h2>
            </div>

            {/* Network Codes */}
            <div className="space-y-3">
              {network.codes.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground mb-1">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {item.code}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(item.code)}
                    className="h-8 w-8 text-muted-foreground no-focus-active bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SortCodeInquiryPage;