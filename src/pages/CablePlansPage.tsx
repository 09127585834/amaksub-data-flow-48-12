import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BillerLoadingSkeleton } from '@/components/ui/loading-skeleton';

const CablePlansPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedNetwork, smartCardNumber, phoneNumber } = location.state || {};
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Persistent data fetching with retry logic
  const fetchPlans = async (retryCount = 0) => {
    const maxRetries = 50;
    const retryDelay = 2000;
    
    try {
      const tableName = selectedNetwork?.toUpperCase();
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('description', { ascending: true });
      
      if (error) throw error;
      
      setPlans(data || []);
      setIsLoading(false);
    } catch (error) {
      console.log(`Fetch attempt ${retryCount + 1} failed, retrying...`);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchPlans(retryCount + 1);
        }, retryDelay);
      } else {
        setPlans([]);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedNetwork) {
      fetchPlans();
    }
  }, [selectedNetwork]);

  const handlePlanSelect = (plan: any) => {
    navigate('/cable', { 
      state: { 
        selectedPlan: plan,
        selectedNetwork: selectedNetwork
      } 
    });
  };

  const getNetworkDisplayName = () => {
    return selectedNetwork?.toUpperCase() || 'Cable';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/cable')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">
          {getNetworkDisplayName()} Plans
        </h1>
        
        <div className="w-10" />
      </header>

      {/* Plans List */}
      <div className="p-4">
        {isLoading ? (
          <BillerLoadingSkeleton count={8} />
        ) : (
          plans.map((plan, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handlePlanSelect(plan)}
              className="w-full h-20 justify-between text-left p-4 mb-2 border border-border !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 aria-selected:!bg-transparent aria-pressed:!bg-transparent data-[state=open]:!bg-transparent"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <div className="flex flex-col items-start">
                <span className="text-base font-medium text-foreground">{plan.description}</span>
                <span className="text-sm text-muted-foreground">₦{parseFloat(plan.price).toLocaleString()}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default CablePlansPage;