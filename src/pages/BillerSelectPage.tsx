import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { BillerLoadingSkeleton } from '@/components/ui/loading-skeleton';

const BillerSelectPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedBiller, selectedBillerCode } = location.state || {};
  const [billers, setBillers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Persistent data fetching with retry logic
  const fetchBillers = async (retryCount = 0) => {
    const maxRetries = 50; // Keep trying for a long time
    const retryDelay = 2000; // 2 seconds between retries
    
    try {
      const { data, error } = await supabase
        .from('ELECTRICITY')
        .select('*')
        .order('description', { ascending: true });
      
      if (error) throw error;
      
      setBillers(data || []);
      setIsLoading(false);
    } catch (error) {
      console.log(`Fetch attempt ${retryCount + 1} failed, retrying...`);
      
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchBillers(retryCount + 1);
        }, retryDelay);
      } else {
        setBillers([]);
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchBillers();
  }, []);

  const handleBillerSelect = (biller: { code: string; description: string; value: string }) => {
    navigate('/electricity', { 
      state: { returnedBiller: { 
        code: biller.code, 
        name: biller.description
      }} 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-4 bg-background">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate('/electricity')}
          className="h-10 w-10 no-focus-active"
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-foreground">Select Biller</h1>
        
        <div className="w-10" /> {/* Spacer for center alignment */}
      </header>

      {/* Biller List */}
      <div className="p-4">
        {isLoading ? (
          <BillerLoadingSkeleton count={8} />
        ) : (
          billers.map((biller, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={() => handleBillerSelect(biller)}
              className="w-full h-16 justify-between text-left p-4 mb-2 border border-border !bg-transparent hover:!bg-transparent active:!bg-transparent focus:!bg-transparent focus-visible:ring-0 aria-selected:!bg-transparent aria-pressed:!bg-transparent data-[state=open]:!bg-transparent"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="text-base font-medium text-foreground">{biller.description}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Button>
          ))
        )}
      </div>
    </div>
  );
};

export default BillerSelectPage;