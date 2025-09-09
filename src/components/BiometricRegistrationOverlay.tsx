import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface BiometricRegistrationOverlayProps {
  onSkip: () => void;
  onSuccess: () => void;
  userEmail: string;
}

const BiometricRegistrationOverlay = ({ onSkip, onSuccess, userEmail }: BiometricRegistrationOverlayProps) => {
  const [showUsernameField, setShowUsernameField] = useState(false);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const showErrorPopup = (message: string) => {
    const errorPopup = document.createElement('div');
    errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    errorPopup.innerHTML = `
      <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
        <h3 class="text-xl font-bold text-destructive mb-4">Error</h3>
        <p class="text-muted-foreground mb-6">${message}</p>
        <button onclick="this.parentElement.parentElement.remove()" 
                class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
          Okay
        </button>
      </div>
    `;
    document.body.appendChild(errorPopup);
  };

  const handleSwitchToggle = () => {
    setShowUsernameField(true);
  };

  const handleUsernameValidation = async () => {
    if (!username.trim()) {
      showErrorPopup('Please enter your username.');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Checking username:', username); // Debug log
      
      // Check if username exists in the database
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .eq('username', username)
        .maybeSingle();

      console.log('Database response:', { data, error }); // Debug log

      if (error) {
        console.error('Database error:', error);
        showErrorPopup('Database error occurred. Please try again.');
        setIsLoading(false);
        return;
      }

      if (!data) {
        showErrorPopup('Username not found. Please enter the correct username.');
        setIsLoading(false);
        return;
      }

      console.log('Username found, registering biometric...'); // Debug log

      // Register biometric
      await registerBiometric();

      // Persist biometric registration status globally
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) {
          const { error: updateError } = await supabase
            .from('users')
            .update({ biometric_registered: true })
            .eq('id', user.id);
          if (updateError) {
            console.error('Failed to update biometric flag in DB:', updateError);
          }
        }
      } catch (e) {
        console.error('Error persisting biometric flag:', e);
      }

      // Also cache locally on this device for quick checks
      localStorage.setItem('biometric_registered', 'true');

      onSuccess();
    } catch (error) {
      console.error('Username validation error:', error);
      showErrorPopup('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const registerBiometric = async () => {
    try {
      // Check if WebAuthn is supported
      if (!window.PublicKeyCredential || 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable !== 'function') {
        throw new Error('Biometric authentication is not supported on this device.');
      }

      const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        throw new Error('Biometric authentication is not available on this device.');
      }

      // Create credential request options
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credentialCreationOptions = {
        challenge: challenge,
        rp: {
          name: "Amaksub Data",
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userEmail),
          name: userEmail,
          displayName: username,
        },
        pubKeyCredParams: [{alg: -7, type: "public-key" as const}],
        authenticatorSelection: {
          authenticatorAttachment: "platform" as AuthenticatorAttachment,
          userVerification: "required" as UserVerificationRequirement,
          requireResidentKey: false,
        },
        timeout: 60000,
        attestation: "direct" as AttestationConveyancePreference,
      };

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: credentialCreationOptions
      }) as PublicKeyCredential;

      if (credential) {
        console.log('Biometric registration successful');
        return true;
      }
    } catch (error: any) {
      console.error('Biometric registration failed:', error);
      throw error;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center">
        {!showUsernameField ? (
          <>
            <div className="mb-6">
              <Shield className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Enable Biometric</h3>
              <p className="text-muted-foreground">
                Secure your account with biometric authentication for faster login.
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-8">
              <span className="text-foreground font-medium">Enable Biometric</span>
              <Switch 
                onCheckedChange={handleSwitchToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            <Button 
              onClick={onSkip}
              variant="outline"
              className="w-full h-12 text-lg font-semibold"
            >
              Skip
            </Button>
          </>
        ) : (
          <>
            <div className="mb-6">
              <User className="w-16 h-16 mx-auto text-primary mb-4" />
              <h3 className="text-2xl font-bold text-foreground mb-2">Enter Username</h3>
              <p className="text-muted-foreground">
                Please enter your username to register biometric authentication.
              </p>
            </div>

            <div className="relative mb-6">
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full h-12 pl-4 pr-12 text-lg border border-input rounded-xl bg-muted/50 placeholder-muted-foreground"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            </div>

            <Button 
              onClick={handleUsernameValidation}
              disabled={isLoading}
              className="w-full h-12 fintech-button text-lg font-semibold"
            >
              {isLoading ? 'Validating...' : 'Enable'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default BiometricRegistrationOverlay;