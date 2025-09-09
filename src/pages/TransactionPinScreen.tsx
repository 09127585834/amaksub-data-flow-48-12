import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const TransactionPinScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const [pin, setPin] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);

  // Get data from navigation state
  const email = location.state?.email || '';
  const phoneNumber = location.state?.phoneNumber || '';
  const formData = location.state?.formData || {};

  const handlePinInput = (digit: string) => {
    const emptyIndex = pin.findIndex(p => p === '');
    if (emptyIndex !== -1) {
      const newPin = [...pin];
      newPin[emptyIndex] = digit;
      setPin(newPin);
      
      // If all 4 digits are entered, show completion popup
      if (emptyIndex === 3) {
        showCompletionPopup(newPin);
      }
    }
  };

  const handleDelete = () => {
    const lastFilledIndex = pin.map((p, i) => p !== '' ? i : -1).filter(i => i !== -1).pop();
    if (lastFilledIndex !== undefined) {
      const newPin = [...pin];
      newPin[lastFilledIndex] = '';
      setPin(newPin);
    }
  };

  const showCompletionPopup = async (completedPin?: string[]) => {
    // Build final 4-digit PIN from latest input (avoid stale state)
    const effectivePin = completedPin ?? pin;
    const pinString = effectivePin.join('');
    if (effectivePin.length !== 4 || effectivePin.some(d => d === '')) {
      console.error('Invalid PIN length; expected 4 digits, got:', effectivePin);
      return;
    }
    setIsLoading(true);
    const loadingPopup = document.createElement('div');
    loadingPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    loadingPopup.innerHTML = `
      <div class="flex flex-col items-center text-center animate-fade-in">
        <div class="relative mb-4">
          <div class="w-20 h-20 rounded-full overflow-hidden bg-white p-2">
            <img 
              src="/lovable-uploads/8f7f7ca2-68e2-4ebe-97d2-16b3abf34b89.png" 
              alt="Amaksub Data" 
              class="w-full h-full object-contain rounded-full"
            />
          </div>
          <div class="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin"></div>
        </div>
        <p class="text-white text-lg font-semibold">Please wait</p>
      </div>
    `;
    document.body.appendChild(loadingPopup);

    try {
      console.log('PIN being saved:', pinString, 'Length:', pinString.length, 'PIN array:', effectivePin);
      let accountInfo: { account_number: string; account_name: string; bank_name: string } | null = null;

      // Get current session to check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        // Existing user: Check if virtual account already exists
        const { data: profile } = await supabase
          .from('users')
          .select('paystack_account_number, paystack_account_name, paystack_bank_name')
          .eq('id', session.user.id)
          .maybeSingle();

        if (profile?.paystack_account_number) {
          accountInfo = {
            account_number: profile.paystack_account_number,
            account_name: profile.paystack_account_name,
            bank_name: profile.paystack_bank_name,
          };
        } else {
          const { data: virtualAccountData, error: virtualAccountError } = await supabase.functions.invoke('create-virtual-account', {
            body: {
              username: formData.username,
              email: formData.email,
              phoneNumber: formData.phoneNumber,
              fullName: formData.fullName
            }
          });
  
          if (virtualAccountError || !virtualAccountData?.success) {
            throw virtualAccountError || new Error(virtualAccountData?.error || 'Failed to create virtual account');
          }
  
          accountInfo = {
            account_number: virtualAccountData.data.account_number,
            account_name: virtualAccountData.data.account_name,
            bank_name: virtualAccountData.data.bank_name,
          };
        }

        // Update users table with PIN and virtual account info
        const { error: updateProfileError } = await supabase
          .from('users')
          .update({
            transaction_pin: pinString,
            phone_number: formData.phoneNumber || undefined,
            virtual_account_number: accountInfo.account_number,
            virtual_account_bank: accountInfo.bank_name,
            paystack_account_number: accountInfo.account_number,
            paystack_account_name: accountInfo.account_name,
            paystack_bank_name: accountInfo.bank_name,
          })
          .eq('id', session.user.id);

        if (updateProfileError) throw updateProfileError;

        // Remove loading popup
        loadingPopup.remove();

        // Redirect to dashboard
        navigate('/dashboard', {
          replace: true,
          state: {
            virtualAccount: accountInfo
          }
        });
      } else {
        // New user: create virtual account then sign them up
        const { data: virtualAccountData, error: virtualAccountError } = await supabase.functions.invoke('create-virtual-account', {
          body: {
            username: formData.username,
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            fullName: formData.fullName
          }
        });

        if (virtualAccountError || !virtualAccountData?.success) {
          throw virtualAccountError || new Error(virtualAccountData?.error || 'Failed to create virtual account');
        }

        const { error: signUpError } = await signUp(formData.email, formData.password, {
          fullName: formData.fullName,
          username: formData.username,
          phoneNumber: formData.phoneNumber,
          referralCode: formData.referralCode,
          transaction_pin: pinString,
          virtual_account_number: virtualAccountData.data.account_number,
          virtual_account_bank: virtualAccountData.data.bank_name,
          paystack_account_number: virtualAccountData.data.account_number,
          paystack_account_name: virtualAccountData.data.account_name,
          paystack_bank_name: virtualAccountData.data.bank_name,
        });

        if (signUpError) throw signUpError;

        // Wait a moment then get the current session to ensure user is authenticated
        await new Promise(resolve => setTimeout(resolve, 1000));
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Ensure profile has correct data regardless of trigger state (upsert by id)
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: session.user.id,
              email: formData.email,
              username: formData.username,
              full_name: formData.fullName,
              phone_number: formData.phoneNumber,
              referral_code: formData.referralCode || null,
              transaction_pin: pinString,
              password_hash: '', // Handled by auth
              paystack_account_number: virtualAccountData.data.account_number,
              paystack_account_name: virtualAccountData.data.account_name,
              paystack_bank_name: virtualAccountData.data.bank_name,
              virtual_account_number: virtualAccountData.data.account_number,
              virtual_account_bank: virtualAccountData.data.bank_name,
              balance: 0,
              is_active: true
            }, { onConflict: 'id' });

          if (upsertError) {
            console.error('Error saving user profile:', upsertError);
            // Don't throw error as auth user is already created
          }
        }

        // Remove loading popup
        loadingPopup.remove();

        // Redirect to dashboard
          navigate('/dashboard', {
            replace: true,
            state: {
              virtualAccount: virtualAccountData.data,
              showWelcome: true
            }
          });
      }
      
    } catch (error) {
      console.error('Error creating account:', error);
      
      // Remove loading popup
      loadingPopup.remove();
      
      // Show error popup
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Account Creation Failed</h3>
          <p class="text-muted-foreground mb-6">Failed to create your account. Please try again.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl w-full">
            Try Again
          </button>
        </div>
      `;
      document.body.appendChild(errorPopup);
    } finally {
      setIsLoading(false);
    }
  };

  const keypadNumbers = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['', '0', 'delete']
  ];

  return (
    <div className="min-h-screen white-glossy relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
      </div>

      {/* Main content */}
      <main className="relative z-10 px-8 py-12 max-w-md mx-auto flex flex-col min-h-screen">
        <div className="animate-fade-in">
          {/* Header */}
          <div className="text-left mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Set Transaction PIN
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Create a secure 4-digit PIN to authorize your transactions. This PIN will be required for all future transactions.
            </p>
          </div>

          {/* PIN Input Display */}
          <div className="mb-6">
            <div className="flex justify-center gap-4 mb-4">
              {pin.map((digit, index) => (
                <div
                  key={index}
                  className="w-10 h-10 rounded-full border-2 border-input flex items-center justify-center text-lg font-bold text-foreground shadow-lg"
                >
                  {digit && (
                    <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Numeric Keypad */}
          <div className="flex justify-center">
            <div className="grid grid-cols-3 gap-12 w-fit mx-auto">
              {keypadNumbers.flat().map((key, index) => {
                if (key === '') {
                  return <div key={index} className="w-16 h-16"></div>;
                }
                
                if (key === 'delete') {
                  return (
                    <button
                      key={index}
                      onClick={handleDelete}
                      className="w-16 h-16 flex items-center justify-center text-xl font-semibold text-muted-foreground hover:text-primary transition-all duration-200"
                      disabled={isLoading}
                    >
                      ⌫
                    </button>
                  );
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handlePinInput(key)}
                    className="w-16 h-16 flex items-center justify-center text-2xl font-bold text-foreground hover:text-primary transition-all duration-200"
                    disabled={pin.every(p => p !== '') || isLoading}
                  >
                    {key}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TransactionPinScreen;