import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import mtnLogo from '@/assets/mtn-logo.png';
import gloLogo from '@/assets/glo-logo.png';
import airtelLogo from '@/assets/airtel-logo.png';
import nineMobileLogo from '@/assets/9mobile-logo.png';

const BeneficiaryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const returnPath = location.state?.returnPath || '/dashboard';
  const serviceType = location.state?.serviceType || 'airtime';

  const getNetworkLogo = (network: string) => {
    const networkLogos: { [key: string]: string } = {
      'mtn': mtnLogo,
      'glo': gloLogo,
      'airtel': airtelLogo,
      '9mobile': nineMobileLogo
    };
    return networkLogos[network.toLowerCase()] || gloLogo;
  };

  const fetchBeneficiaries = async () => {
    if (!user) return;
    try {
      let data: any[] = [];
      
      if (serviceType === 'data-bundle') {
        // Fetch only successfully purchased data bundle beneficiaries from transaction history
        const { data: transactionData, error: transactionError } = await supabase
          .from('transaction_history')
          .select('mobile_number, mobile_network')
          .eq('user_id', user.id)
          .eq('transaction_type', 'data_bundle')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (transactionError) throw transactionError;
        
        // Convert to beneficiary format and remove duplicates
        const uniqueBeneficiaries = new Map();
        (transactionData || []).forEach(transaction => {
          const key = `${transaction.mobile_number}-${transaction.mobile_network}`;
          if (!uniqueBeneficiaries.has(key)) {
            uniqueBeneficiaries.set(key, {
              id: key,
              mobile_number: transaction.mobile_number,
              mobile_network: transaction.mobile_network,
              network_name: transaction.mobile_network,
              created_at: new Date().toISOString()
            });
          }
        });
        data = Array.from(uniqueBeneficiaries.values());
      } else if (serviceType === 'cable') {
        // Fetch only successfully purchased cable beneficiaries from transaction history
        const { data: transactionData, error: transactionError } = await supabase
          .from('transaction_history')
          .select('mobile_number, mobile_network')
          .eq('user_id', user.id)
          .eq('transaction_type', 'cable')
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (transactionError) throw transactionError;
        
        // Convert to beneficiary format and remove duplicates
        const uniqueBeneficiaries = new Map();
        (transactionData || []).forEach(transaction => {
          const key = `${transaction.mobile_number}-${transaction.mobile_network}`;
          if (!uniqueBeneficiaries.has(key)) {
            uniqueBeneficiaries.set(key, {
              id: key,
              mobile_number: transaction.mobile_number,
              smart_card_number: transaction.mobile_number, // For cable, mobile_number stores smart card number
              mobile_network: transaction.mobile_network,
              network_name: transaction.mobile_network,
              created_at: new Date().toISOString()
            });
          }
        });
        data = Array.from(uniqueBeneficiaries.values());
      } else {
        // Fetch from regular beneficiaries table for other services (airtime)
        const { data: regularData, error: regularError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (regularError) throw regularError;
        data = regularData || [];
      }
      
      setBeneficiaries(data);
    } catch (error) {
      console.error('Error fetching beneficiaries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, [user]);

  const filteredBeneficiaries = beneficiaries.filter(beneficiary =>
    beneficiary.mobile_number.includes(searchQuery) ||
    beneficiary.network_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBeneficiarySelect = (beneficiary: any) => {
    if (serviceType === 'cable') {
      navigate(returnPath, {
        state: {
          selectedBeneficiary: {
            smartCardNumber: beneficiary.smart_card_number || beneficiary.mobile_number,
            selectedNetwork: beneficiary.network_name
          }
        }
      });
    } else {
      navigate(returnPath, {
        state: {
          selectedBeneficiary: {
            mobileNumber: beneficiary.mobile_number,
            selectedNetwork: beneficiary.network_name
          }
        }
      });
    }
  };

  const handleContactsAccess = async () => {
    try {
      // Check if we're in a Median app environment
      if ((window as any).median) {
        // Median app environment - request contacts permission
        (window as any).median.contacts.requestPermission((result: any) => {
          if (result.permission === 'granted') {
            (window as any).median.contacts.getAll((contacts: any) => {
              navigate('/airtime/contacts', { 
                state: { 
                  contacts: contacts,
                  returnPath: returnPath 
                } 
              });
            });
          } else {
            alert('Contacts permission is required to access your contacts.');
          }
        });
      } else {
        // Web environment - show fallback message
        alert('Contact access is only available in the mobile app. Please enter the mobile number manually.');
      }
    } catch (error) {
      console.error('Error accessing contacts:', error);
      alert('Unable to access contacts. Please enter the mobile number manually.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-background">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(returnPath)}
            className="h-10 w-10 no-focus-active"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-foreground">Beneficiary</h1>
        </div>
        <Button 
          variant="ghost" 
          onClick={handleContactsAccess}
          className="text-primary font-medium no-focus-active hover:text-primary"
        >
          Contacts
        </Button>
      </header>

      <div className="p-4">
        {/* Search Field */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search beneficiaries"
              className="pl-10 h-14 text-base focus-visible:ring-0 focus-visible:ring-offset-0 border-input"
            />
          </div>
        </div>

        {/* Beneficiaries List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-center text-muted-foreground text-base">Loading...</p>
          </div>
        ) : filteredBeneficiaries.length > 0 ? (
          <div className="space-y-3">
            {filteredBeneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                onClick={() => handleBeneficiarySelect(beneficiary)}
                className="bg-white p-4 rounded-lg border border-border cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-100">
                    <img 
                      src={getNetworkLogo(beneficiary.network_name)} 
                      alt={`${beneficiary.network_name} logo`}
                      className="w-8 h-8 object-contain rounded-full"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">
                      {beneficiary.smart_card_number || beneficiary.mobile_number}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{beneficiary.network_name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-12">
            <p className="text-center text-muted-foreground text-base">
              {searchQuery ? 'No beneficiaries found' : `Beneficiary will be added automatically if ${serviceType === 'data-bundle' ? 'data bundle' : serviceType} purchase successful`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BeneficiaryPage;