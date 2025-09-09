import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail } from 'lucide-react';

const ForgotPasswordScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      // Show error popup
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Email Required</h3>
          <p class="text-muted-foreground mb-6">Please enter your email address.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
            Okay
          </button>
        </div>
      `;
      document.body.appendChild(errorPopup);
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Invalid Email</h3>
          <p class="text-muted-foreground mb-6">Please enter a valid email address.</p>
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

    try {
      const { data, error } = await supabase.functions.invoke('send-reset-otp', {
        body: { email }
      });

      if (error) throw error;

      if (data.success) {
        // Navigate to password reset verification page
        navigate('/password-reset-verification', { 
          state: { 
            email: email,
            type: 'password-reset'
          } 
        });
      } else {
        // Show error popup
        const errorPopup = document.createElement('div');
        errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        errorPopup.innerHTML = `
          <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
            <h3 class="text-xl font-bold text-red-600 mb-4">Reset Failed</h3>
            <p class="text-muted-foreground mb-6">${data.error || 'Failed to send reset code'}</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
              Okay
            </button>
          </div>
        `;
        document.body.appendChild(errorPopup);
      }
    } catch (error) {
      console.error('Reset error:', error);
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Error</h3>
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
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              Reset your password
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Enter your email address and we'll send you a link to reset your password. Don't worry, it happens to the best of us!
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 no-focus-outline">
            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            </div>

            {/* Navigation and Reset Button */}
            <div className="space-y-4 mt-8">
              {/* Login link */}
              <div className="text-left">
                <button
                  onClick={() => navigate('/login')}
                  className="text-primary font-semibold"
                >
                  Login
                </button>
              </div>

              {/* Reset Button */}
              <Button
                type="button"
                onClick={handleReset}
                disabled={isLoading}
                className="w-full h-16 fintech-button text-xl font-bold"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </div>
                ) : (
                  'Send Reset Code'
                )}
              </Button>

              {/* Create Account link */}
              <div className="text-center mt-6">
                <button
                  onClick={() => navigate('/signup')}
                  className="text-primary font-semibold"
                >
                  Create Account!
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordScreen;