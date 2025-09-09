import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, Eye, EyeOff } from 'lucide-react';

const NewPasswordScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Get data from navigation state
  const email = location.state?.email || '';
  const userId = location.state?.userId || '';

  useEffect(() => {
    if (!email || !userId) {
      navigate('/forgot-password');
    }
  }, [email, userId, navigate]);

  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber;
  };

  const handlePasswordChange = (value: string) => {
    setNewPassword(value);
    
    if (value && !validatePassword(value)) {
      setPasswordError('Password too weak. Use at least 8 characters with uppercase, lowercase, and a number.');
    } else {
      setPasswordError('');
    }
    
    // Also check confirm password match if it exists
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else if (confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    
    if (value && value !== newPassword) {
      setConfirmPasswordError('Passwords do not match.');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!newPassword.trim() || !confirmPassword.trim()) {
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Missing Information</h3>
          <p class="text-muted-foreground mb-6">Please fill in both password fields.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
            Okay
          </button>
        </div>
      `;
      document.body.appendChild(errorPopup);
      return;
    }

    if (newPassword !== confirmPassword) {
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Password Mismatch</h3>
          <p class="text-muted-foreground mb-6">The passwords you entered do not match. Please try again.</p>
          <button onclick="this.parentElement.parentElement.remove()" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
            Okay
          </button>
        </div>
      `;
      document.body.appendChild(errorPopup);
      return;
    }

    if (!validatePassword(newPassword)) {
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Weak Password</h3>
          <p class="text-muted-foreground mb-6">Password too weak. Use at least 8 characters with uppercase, lowercase, and a number.</p>
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
      // Use reset-password edge function with Service Role to update password directly
      const { data, error } = await supabase.functions.invoke('reset-password', {
        body: {
          userId: userId,
          newPassword: newPassword
        }
      });

      if (error) {
        throw new Error('Failed to reset password. Please try again.');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to reset password. Please try again.');
      }

      // Show success message
      const successPopup = document.createElement('div');
      successPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      successPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-green-600 mb-4">Password Updated Successfully</h3>
          <p class="text-muted-foreground mb-6">${data?.message || 'Your password has been updated successfully. Please log in with your new password.'}</p>
          <button onclick="location.href='/login'" 
                  class="fintech-button px-6 py-3 text-lg font-semibold rounded-xl">
            Okay
          </button>
        </div>
      `;
      document.body.appendChild(successPopup);

    } catch (error) {
      console.error('Password reset error:', error);
      const errorPopup = document.createElement('div');
      errorPopup.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      errorPopup.innerHTML = `
        <div class="white-glossy rounded-3xl p-8 mx-4 max-w-sm w-full text-center animate-fade-in">
          <h3 class="text-xl font-bold text-red-600 mb-4">Reset Failed</h3>
          <p class="text-muted-foreground mb-6">Failed to reset password. Please try again.</p>
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
          <div className="text-left mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              Create New Password
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Please enter your new password below. Make sure it's strong and secure.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 no-focus-outline">
            {/* New Password */}
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => handlePasswordChange(e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 ml-1">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1 ml-1">{confirmPasswordError}</p>
              )}
            </div>

            {/* Reset Button */}
            <Button
              type="button"
              onClick={handleResetPassword}
              disabled={isLoading || !validatePassword(newPassword) || newPassword !== confirmPassword || !!passwordError || !!confirmPasswordError}
              className="w-full h-16 fintech-button text-xl font-bold mt-8"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Resetting...
                </div>
              ) : (
                'Reset Now'
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default NewPasswordScreen;