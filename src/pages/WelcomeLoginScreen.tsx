import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ScanFace, LogOut } from 'lucide-react';
import BiometricRegistrationOverlay from '@/components/BiometricRegistrationOverlay';
import avatarImage from '@/assets/avatar-3d-glasses.png';

const WelcomeLoginScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showBiometricOverlay, setShowBiometricOverlay] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [username, setUsername] = useState('');
  const [biometricRegistered, setBiometricRegistered] = useState<boolean | null>(null);

  // Fetch username from database
  useEffect(() => {
    const fetchUsername = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('users')
            .select('username')
            .eq('id', user.id)
            .single();
          
          if (data && !error) {
            setUsername(data.username);
          }
        } catch (error) {
          console.error('Error fetching username:', error);
        }
      }
    };
    
    fetchUsername();
  }, [user]);

  // Check if biometric authentication is available
  useEffect(() => {
    const checkBiometricSupport = async () => {
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        setIsBiometricAvailable(available);
      }
    };
    checkBiometricSupport();
  }, []);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  // Fetch biometric registration status from DB
  useEffect(() => {
    const fetchBiometric = async () => {
      if (!user?.id) return;
      try {
        const { data } = await supabase
          .from('users')
          .select('biometric_registered')
          .eq('id', user.id)
          .maybeSingle();
        setBiometricRegistered(!!data?.biometric_registered);
      } catch (e) {
        console.error('Error fetching biometric status:', e);
      }
    };
    fetchBiometric();
  }, [user]);

  // Prevent direct dashboard access without PIN validation
  useEffect(() => {
    const pinValidated = sessionStorage.getItem('pin_validated');
    if (pinValidated === 'true') {
      // User already validated PIN in this session, go to dashboard
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handlePinInput = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
  };

  const verifyPin = async () => {
    if (!user || pin.length !== 4) return;
    
    setIsLoading(true);
    
    try {
      // Check user PIN
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('transaction_pin')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;

      // Verify PIN
      if (userData.transaction_pin !== pin) {
        setIsLoading(false);
        setShowError(true);
        return;
      }

      // PIN is correct - mark as validated and check biometric registration
      sessionStorage.setItem('pin_validated', 'true');

      // Determine biometric registration status (DB-first)
      let isRegistered = biometricRegistered;
      if (isRegistered === null && user?.id) {
        try {
          const { data } = await supabase
            .from('users')
            .select('biometric_registered')
            .eq('id', user.id)
            .maybeSingle();
          isRegistered = !!data?.biometric_registered;
          setBiometricRegistered(isRegistered);
        } catch (e) {
          console.error('Failed to fetch biometric status:', e);
        }
      }

      if (!isRegistered) {
        setShowBiometricOverlay(true);
      } else {
        // Send login success email and navigate
        try {
          await supabase.functions.invoke('send-welcome-email', {
            body: {
              email: user.email,
              fullName: '',
              type: 'login'
            }
          });
        } catch (emailError) {
          console.error('Failed to send login email:', emailError);
        }
        
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      setIsLoading(false);
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-verify when PIN is 4 digits
  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const handleBiometricAuth = async () => {
    if (!isBiometricAvailable) {
      return;
    }

    try {
      setIsLoading(true);

      // Create credential request options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialRequestOptions = {
        challenge: challenge,
        allowCredentials: [], // Empty array allows any registered credential
        userVerification: 'required' as UserVerificationRequirement,
        timeout: 60000,
      };

      // Request authentication
      const credential = await navigator.credentials.get({
        publicKey: credentialRequestOptions
      }) as PublicKeyCredential;

      if (credential) {
        // Decide using DB-backed status
        let isRegistered = biometricRegistered;
        if (isRegistered === null && user?.id) {
          try {
            const { data } = await supabase
              .from('users')
              .select('biometric_registered')
              .eq('id', user.id)
              .maybeSingle();
            isRegistered = !!data?.biometric_registered;
            setBiometricRegistered(isRegistered);
          } catch (e) {
            console.error('Failed to fetch biometric status:', e);
          }
        }
        
        if (!isRegistered) {
          setShowBiometricOverlay(true);
        } else {
          // Mark as validated and navigate to dashboard
          sessionStorage.setItem('pin_validated', 'true');
          navigate('/dashboard', { replace: true });
          
          // Send login success email
          if (user?.email) {
            try {
              await supabase.functions.invoke('send-welcome-email', {
                body: {
                  email: user.email,
                  fullName: '',
                  type: 'login'
                }
              });
            } catch (emailError) {
              console.error('Failed to send login email:', emailError);
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Biometric authentication failed:', error);
      // Silent fail for biometric - user can use PIN instead
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  const handleErrorOk = () => {
    setShowError(false);
    setPin('');
  };

  const handleBiometricSkip = async () => {
    setShowBiometricOverlay(false);
    sessionStorage.setItem('pin_validated', 'true');
    
    // Send login success email and navigate
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user?.email || '',
          fullName: '',
          type: 'login'
        }
      });
    } catch (emailError) {
      console.error('Failed to send login email:', emailError);
    }
    
    navigate('/dashboard', { replace: true });
  };

  const handleBiometricSuccess = async () => {
    setShowBiometricOverlay(false);
    sessionStorage.setItem('pin_validated', 'true');
    
    // Send login success email and navigate
    try {
      await supabase.functions.invoke('send-welcome-email', {
        body: {
          email: user?.email || '',
          fullName: '',
          type: 'login'
        }
      });
    } catch (emailError) {
      console.error('Failed to send login email:', emailError);
    }
    
    navigate('/dashboard', { replace: true });
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col items-center p-4">
        {/* Title */}
        <h1 className="text-lg font-semibold text-foreground text-center mb-8 mt-12">
          Enter your 4-digit PIN or use biometrics to log in
        </h1>

        {/* Avatar */}
        <div className="mb-8">
          <img 
            src={avatarImage} 
            alt="User Avatar" 
            className="w-24 h-24 rounded-full object-cover"
          />
        </div>

        {/* PIN Display */}
        <div className="flex space-x-4 mb-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full border-2 ${
                index < pin.length 
                  ? 'bg-primary border-primary' 
                  : 'border-border'
              }`}
            />
          ))}
        </div>

        {/* Numeric Keypad */}
        <div className="grid grid-cols-3 gap-12 max-w-sm mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button
              key={digit}
              className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
              onClick={() => handlePinInput(digit.toString())}
              disabled={isLoading}
            >
              {digit}
            </button>
          ))}
          
          {biometricRegistered && isBiometricAvailable ? (
            <button
              className="h-20 w-20 flex items-center justify-center text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none"
              onClick={handleBiometricAuth}
              disabled={isLoading || !isBiometricAvailable || !biometricRegistered}
              title="Use biometric authentication"
            >
              <ScanFace size={24} />
            </button>
          ) : (
            <div className="h-20 w-20"></div>
          )}
          
          <button
            className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
            onClick={() => handlePinInput('0')}
            disabled={isLoading}
          >
            0
          </button>
          
          <button
            className="h-20 w-20 text-2xl font-semibold text-foreground hover:text-primary transition-colors duration-200 focus:outline-none"
            onClick={handleBackspace}
            disabled={isLoading}
          >
            ⌫
          </button>
        </div>

        {/* Not my account section at bottom */}
        <div className="mt-16 text-center">
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-destructive transition-colors duration-300 font-medium"
          >
            Not my account! Logout
          </button>
        </div>
      </div>

      {/* Loading Popup */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center text-center animate-fade-in">
            <div className="relative mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-white p-2">
                <img 
                  src="/lovable-uploads/8f7f7ca2-68e2-4ebe-97d2-16b3abf34b89.png" 
                  alt="Amaksub Data" 
                  className="w-full h-full object-contain rounded-full"
                />
              </div>
              <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
            </div>
            <p className="text-white text-lg font-semibold">Please wait</p>
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center mx-4 max-w-sm w-full">
            <p className="text-red-500 mb-4 text-lg">Incorrect PIN. Please try again.</p>
            <Button onClick={handleErrorOk} className="px-8 w-full">
              Okay
            </Button>
          </div>
        </div>
      )}

      {/* Biometric Registration Overlay */}
      {showBiometricOverlay && (
        <BiometricRegistrationOverlay 
          onSkip={handleBiometricSkip}
          onSuccess={handleBiometricSuccess}
          userEmail={user?.email || ''}
        />
      )}
    </div>
  );
};

export default WelcomeLoginScreen;