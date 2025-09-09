import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Key } from 'lucide-react';
import BiometricRegistrationOverlay from '@/components/BiometricRegistrationOverlay';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [showBiometricOverlay, setShowBiometricOverlay] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already logged in and PIN validated
  useEffect(() => {
    if (user) {
      const pinValidated = sessionStorage.getItem('pin_validated');
      if (pinValidated === 'true') {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/welcome-login', { replace: true });
      }
    }
  }, [user, navigate]);

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!emailOrUsername.trim() || !password.trim()) {
      // Show error popup instead of toast
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        errorPopup.innerHTML = `
          <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
            <h3 class="text-xl font-bold text-red-600 mb-4">Validation Error</h3>
            <p class="text-muted-foreground mb-6">Please enter both email address and password.</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
              Okay
            </button>
          </div>
        `;
      document.body.appendChild(errorPopup);
      return;
    }

    setIsLoading(true);
    setShowLoadingPopup(true);
    
    try {
      const { error } = await signIn(emailOrUsername, password);
      
      if (error) {
        setShowLoadingPopup(false);
        // Show error popup instead of toast
        const errorPopup = document.createElement('div');
        errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        errorPopup.innerHTML = `
          <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
            <h3 class="text-xl font-bold text-red-600 mb-4">Login Failed</h3>
            <p class="text-muted-foreground mb-6">${error.message}</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
              Okay
            </button>
          </div>
        `;
        document.body.appendChild(errorPopup);
      } else {
        setShowLoadingPopup(false);
        
        // Send login success email and navigate directly to dashboard
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: emailOrUsername.includes('@') ? emailOrUsername : user?.email,
              fullName: '', // Let the function fetch from database
              type: 'login'
            }
          });
        } catch (emailError) {
          console.error('Failed to send login email:', emailError);
        }
        
        navigate('/welcome-login', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setShowLoadingPopup(false);
      // Show error popup instead of toast
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Login Failed</h3>
          <p class="text-muted-foreground mb-6">An unexpected error occurred. Please try again.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
            Okay
          </button>
        </div>
      `;
      document.body.appendChild(errorPopup);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricSkip = async () => {
    setShowBiometricOverlay(false);
    
    // Send login success email and navigate
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: emailOrUsername.includes('@') ? emailOrUsername : user?.email,
          fullName: '',
          type: 'login'
        }
      });
    } catch (emailError) {
      console.error('Failed to send login email:', emailError);
    }
    
    navigate('/welcome-login', { replace: true });
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricOverlay(false);
    
    // Send login success email and navigate
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: emailOrUsername.includes('@') ? emailOrUsername : user?.email,
          fullName: '',
          type: 'login'
        }
      });
    } catch (emailError) {
      console.error('Failed to send login email:', emailError);
    }
    
    navigate('/welcome-login', { replace: true });
  };

  return (
    <div className="min-h-screen white-glossy relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
      </div>
      
      {/* Main content */}
      <main className="relative z-10 px-8 py-8 max-w-md mx-auto pt-16">
        <div className="animate-fade-in">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              Sign In
            </h1>
            <p className="text-gray-600 text-sm">
              Welcome back! Please sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-6 no-focus-outline">
            {/* Email Address */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Email Address"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Key className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            </div>

            {/* Forgot Password */}
            <div className="text-left mt-6">
              <button 
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-primary font-semibold"
              >
                Forget Password!
              </button>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 fintech-button text-lg font-bold mt-4"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-8">
            <span className="text-gray-600">
              Don't have an account? 
            </span>
            <button
              onClick={() => navigate('/signup')}
              className="text-primary font-semibold ml-1"
            >
              Sign Up
            </button>
          </div>
        </div>
      </main>

      {/* Loading Popup */}
      {showLoadingPopup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-center animate-fade-in">
            {/* Logo with spinning animation */}
            <div className="relative mb-4">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden relative">
                <img 
                  src="/lovable-uploads/b03f399e-f878-4aad-b13e-7a72405d5464.png" 
                  alt="Amaksub Data" 
                  className="w-full h-full object-cover"
                />
                {/* Spinning border */}
                <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
              </div>
            </div>
            
            {/* Loading text */}
            <p className="text-white text-lg font-semibold">
              Please wait...
            </p>
          </div>
        </div>
      )}

      {/* Biometric Registration Overlay */}
      {showBiometricOverlay && (
        <BiometricRegistrationOverlay 
          onSkip={handleBiometricSkip}
          onSuccess={handleBiometricSuccess}
          userEmail={emailOrUsername.includes('@') ? emailOrUsername : user?.email || ''}
        />
      )}
    </div>
  );
};

export default LoginScreen;