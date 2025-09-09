import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
  import { 
  Eye, 
  EyeOff, 
  Copy, 
  Headphones, 
  Bell, 
  Smartphone, 
  Phone, 
  Tv, 
  Zap, 
  CreditCard, 
  BookOpen, 
  Users, 
  Home, 
  Wallet, 
  User,
  Plus,
  ArrowRightLeft,
  Printer
} from 'lucide-react';
import avatarImage from '@/assets/avatar-3d-glasses.png';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Get virtual account data from navigation state (if available)
  const virtualAccount = location.state?.virtualAccount;
  const welcomeSentRef = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user has validated PIN in this session
    const pinValidated = sessionStorage.getItem('pin_validated');
    if (!pinValidated || pinValidated !== 'true') {
      navigate('/welcome-login', { replace: true });
      return;
    }

    fetchUserProfile();
  }, [user, loading, navigate]);

  // Add real-time subscription for balance updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance updated via realtime:', payload.new);
          setUserProfile(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Separate useEffect for welcome email - runs after userProfile is loaded
  useEffect(() => {
    if (location.state?.showWelcome && !welcomeSentRef.current && userProfile && !userProfile.welcome_email_sent) {
      welcomeSentRef.current = true;
      sendWelcomeEmail();
      
      // Clear navigation state
      navigate(location.pathname, {
        replace: true,
        state: { ...location.state, showWelcome: false }
      });
    }
  }, [userProfile, location.state, navigate, location.pathname]);

  const sendWelcomeEmail = async () => {
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user?.email,
          fullName: user?.user_metadata?.full_name || userProfile?.full_name || 'User',
          type: 'signup'
        }
      });

      if (user?.id) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ welcome_email_sent: true })
          .eq('id', user.id);
        if (updateError) throw updateError;
        setUserProfile((prev: any) => ({ ...prev, welcome_email_sent: true }));
      }
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      console.log('Dashboard: Fetching user profile for user:', user.id);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      console.log('Dashboard: User profile fetched successfully');
      setUserProfile(data);
      
      // Force refresh of balance every time
      console.log('User balance fetched:', data.balance);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Don't show toast for network errors - keep loading state friendly
    } finally {
      console.log('Dashboard: Setting profileLoading to false');
      setProfileLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Wema Account Number Copied",
        className: "bg-transparent border-none shadow-none",
        duration: 2000,
      });
    } catch (error) {
      toast({
        description: "Failed to copy account number",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const getVirtualAccountNumber = () => {
    return userProfile?.paystack_account_number || virtualAccount?.account_number || '';
  };

  const formatBalance = (balance: number) => {
    return balanceVisible ? `₦${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••••••';
  };


  const dashboardFeatures = [
    // Row 1
    { name: 'Data', icon: Smartphone },
    { name: 'Airtime', icon: Phone },
    { name: 'Cable', icon: Tv },
    { name: 'Electricity', icon: Zap },
    // Row 2
    { name: 'Recharge Card', icon: Printer },
    { name: 'Exam', icon: BookOpen },
    { name: 'Refer & Earn', icon: Users },
    { name: 'Data Card', icon: CreditCard },
  ];

  const bottomNavigation = [
    { name: 'Home', icon: Home },
    { name: 'Wallet', icon: Wallet },
    { name: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-between items-center p-4 bg-background">
        <div className="flex items-center space-x-3">
          <img 
            src={avatarImage} 
            alt="User Avatar" 
            className="h-15 w-15 rounded-full object-cover"
            style={{ height: '60px', width: '60px' }}
          />
          <div>
            {profileLoading ? (
              <div className="h-6 w-32 bg-gradient-to-r from-primary/30 to-primary/50 rounded animate-pulse shadow-lg"></div>
            ) : (
              <span className="text-lg font-bold text-foreground">Hi, {userProfile?.username}</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 no-focus-active"
            onClick={() => window.open('https://wa.me/2348029686989', '_blank')}
          >
            <Headphones className="h-10 w-10" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-12 w-12 no-focus-active"
            onClick={() => navigate('/transaction-history')}
          >
            <Bell className="h-10 w-10" />
          </Button>
        </div>
      </header>

      {/* Main Content with top padding for fixed header */}
      <main className="pt-20">
        {/* Balance Section - Flat Responsive Design */}
      <div className="w-[90%] max-w-[400px] mx-auto my-4 py-6 px-4 text-white bg-primary rounded-xl">
        <h2 className="text-lg font-medium mb-3">Wallet Balance</h2>
        <div className="flex justify-between items-center">
          {profileLoading ? (
            <div className="h-7 w-32 bg-white/30 rounded animate-pulse"></div>
          ) : (
            <span className="text-2xl font-bold">
              {formatBalance(userProfile?.balance || 0)}
            </span>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setBalanceVisible(!balanceVisible)}
            className="text-white hover:bg-transparent focus:bg-transparent active:bg-transparent h-10 w-10"
          >
            {balanceVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Fund/Transfer Section - Flat Responsive Cards */}
      <div className="w-[90%] max-w-[400px] mx-auto my-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center space-y-2 text-primary">
              <div className="bg-primary/10 p-3 rounded-full">
                <Wallet className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">Fund wallet</span>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <div className="flex flex-col items-center space-y-2 text-primary">
              <div className="bg-primary/10 p-3 rounded-full">
                <ArrowRightLeft className="h-5 w-5" />
              </div>
              <span className="font-medium text-sm">Transfer</span>
            </div>
          </div>
        </div>

        {/* Wema Bank Card - Flat Responsive Design */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 relative h-24">
          {/* Card chip */}
          <div className="absolute top-2 left-4">
            <div className="w-6 h-4 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded border border-yellow-700/20 relative">
              <div className="absolute inset-0.5 grid grid-cols-3 gap-0.5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-yellow-700/30 rounded-sm"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Copy button */}
          <div className="absolute top-1 right-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => copyToClipboard(getVirtualAccountNumber())}
              className="text-gray-600 h-6 w-6 no-focus-active bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>

          {/* Account Number */}
          <div className="mt-6">
            {profileLoading ? (
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <p className="text-sm font-mono font-bold text-gray-800 tracking-wider select-none" style={{ textDecoration: 'none', userSelect: 'text' }}>
                {getVirtualAccountNumber().replace(/(.{4})/g, '$1 ').trim()}
              </p>
            )}
          </div>

          {/* Bottom section */}
          <div className="absolute bottom-1 left-4 right-4 flex justify-between items-end">
            <div>
              <p className="text-xs text-gray-800 font-semibold">Wema Bank</p>
            </div>
            <div className="text-right">
              {profileLoading ? (
                <div className="h-2 w-20 bg-gray-200 rounded animate-pulse"></div>
              ) : (
                <p className="text-xs font-semibold text-gray-800">Amaksubdata_{userProfile?.username}</p>
              )}
            </div>
          </div>

          {/* Mastercard-style circles decoration */}
          <div className="absolute bottom-1 right-12 flex">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <div className="w-4 h-4 bg-primary/60 rounded-full -ml-1"></div>
          </div>
        </div>
      </div>

      {/* Dashboard Features - Responsive Grid */}
      <div className="w-[95%] max-w-[480px] mx-auto my-6">
        <div className="grid grid-cols-4 gap-3 mb-4">
          {dashboardFeatures.slice(0, 4).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center space-y-2 p-3 cursor-pointer"
                onClick={() => {
                  console.log('Clicked feature:', feature.name);
                  if (feature.name === 'Data') {
                    console.log('Navigating to data-bundle');
                    navigate('/data-bundle');
                  } else if (feature.name === 'Electricity') {
                    navigate('/electricity');
                  } else if (feature.name === 'Airtime') {
                    navigate('/airtime');
                  } else if (feature.name === 'Cable') {
                    navigate('/cable');
                  } else if (feature.name === 'Recharge Card') {
                    navigate('/recharge-card');
                  } else if (feature.name === 'Data Card') {
                    navigate('/data-card');
                  } else if (feature.name === 'Exam') {
                    navigate('/exam');
                  }
                }}
              >
                <div className="bg-primary/10 p-3 rounded-xl">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-[10px] text-center font-medium text-foreground leading-tight whitespace-nowrap">{feature.name}</span>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-4 gap-3">
          {dashboardFeatures.slice(4, 8).map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index} 
                className="flex flex-col items-center space-y-2 p-3 cursor-pointer"
                onClick={() => {
                  if (feature.name === 'Recharge Card') {
                    navigate('/recharge-card');
                  } else if (feature.name === 'Data Card') {
                    navigate('/data-card');
                  } else if (feature.name === 'Exam') {
                    navigate('/exam');
                  }
                }}
              >
                <div className="bg-primary/10 p-3 rounded-xl">
                  <IconComponent className="h-6 w-6 text-primary" />
                </div>
                <span className="text-[10px] text-center font-medium text-foreground leading-tight whitespace-nowrap">{feature.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Navigation - Flat Responsive Design */}
      <div className="fixed bottom-0 left-0 right-0 bg-background z-50 pb-2">
        <div className="w-[90%] max-w-[400px] mx-auto">
          <div className="grid grid-cols-3 gap-4 px-4 py-3">
            <div className="flex justify-start">
              <div className="flex flex-col items-center space-y-1 p-2">
                <Home className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-primary">Home</span>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-1 p-2">
                <Wallet className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-foreground">Wallet</span>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="flex flex-col items-center space-y-1 p-2">
                <User className="h-5 w-5 text-primary" />
                <span className="text-xs font-medium text-foreground">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
};

export default Dashboard;