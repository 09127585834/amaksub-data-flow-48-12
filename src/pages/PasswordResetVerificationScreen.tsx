import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PasswordResetVerificationScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60); // 1 minute in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get data from navigation state
  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }
    
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [email, navigate]);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      // Focus previous input on backspace
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      if (/\d/.test(pastedData[i])) {
        newOtp[i] = pastedData[i];
      }
    }
    
    setOtp(newOtp);
  };

  const handleConfirm = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Incomplete Code</h3>
          <p class="text-muted-foreground mb-6">Please enter all 6 digits of your verification code.</p>
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
      const { data, error } = await supabase.functions.invoke('verify-reset-otp', {
        body: {
          email: email,
          otp: otpString
        }
      });

      if (error) throw error;

      if (data.success) {
        // Redirect to new password page
        navigate('/new-password', { 
          state: { 
            email: email,
            userId: data.userId 
          } 
        });
      } else {
        // Show error popup
        const errorPopup = document.createElement('div');
        errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
        errorPopup.innerHTML = `
          <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
            <h3 class="text-xl font-bold text-red-600 mb-4">Invalid Code</h3>
            <p class="text-muted-foreground mb-6">${data.error || 'The verification code is incorrect or has expired.'}</p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
              Okay
            </button>
          </div>
        `;
        document.body.appendChild(errorPopup);
      }
    } catch (error) {
      console.error('Verification error:', error);
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Verification Failed</h3>
          <p class="text-muted-foreground mb-6">Something went wrong. Please try again.</p>
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

  const handleResendCode = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-reset-otp', {
        body: { email: email }
      });

      if (error) throw error;

      if (data.success) {
        // Reset timer and clear OTP
        setTimeLeft(60);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        
        // Focus first input
        if (inputRefs.current[0]) {
          inputRefs.current[0].focus();
        }

        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
      } else {
        throw new Error(data.error || 'Failed to resend code');
      }
    } catch (error) {
      console.error('Error resending code:', error);
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Error</h3>
          <p class="text-muted-foreground mb-6">Failed to resend verification code. Please try again.</p>
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
      <main className="relative z-10 px-8 py-12 max-w-md mx-auto">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-left mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Verify Reset Code
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              We've sent a 6-digit verification code to your email 
              <span className="font-semibold text-primary"> {email}</span>. 
              Enter the code below to reset your password.
            </p>
          </div>

          {/* OTP Input Fields */}
          <div className="mb-8">
            <div className="flex justify-center gap-3 mb-6">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-input rounded-full bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 outline-none"
                />
              ))}
            </div>
          </div>

          {/* Confirm Button */}
          <Button
            onClick={handleConfirm}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full h-14 fintech-button text-lg font-bold mb-6"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : (
              'Confirm'
            )}
          </Button>

          {/* Resend Code */}
          <div className="text-center">
            {!canResend ? (
              <div className="mb-4">
                <p className="text-muted-foreground text-sm mb-2">
                  Code expires in: <span className="font-semibold text-primary">{formatTime(timeLeft)}</span>
                </p>
                <p className="text-muted-foreground text-sm">
                  You can request a new code after the timer expires
                </p>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground text-sm mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={isLoading}
                  className="text-primary font-semibold hover:underline disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default PasswordResetVerificationScreen;