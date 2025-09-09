import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// Using the logo URL directly since copy failed
const amaksubLogo = '/lovable-uploads/b03f399e-f878-4aad-b13e-7a72405d5464.png';
const SignUpScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorDialogTitle, setErrorDialogTitle] = useState('');
  const [errorDialogMessage, setErrorDialogMessage] = useState('');
  const [checkingField, setCheckingField] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    phoneNumber: false
  });
  const debounceTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    referralCode: '',
    password: '',
    confirmPassword: ''
  });

  // Password validation state
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');


  const validatePassword = (password: string) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    
    return minLength && hasUppercase && hasLowercase && hasNumber;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Real-time password validation
    if (field === 'password') {
      if (value && !validatePassword(value)) {
        setPasswordError('Password too weak. Use at least 8 characters with uppercase, lowercase, and a number.');
      } else {
        setPasswordError('');
      }
      
      // Also check confirm password match
      if (formData.confirmPassword && value !== formData.confirmPassword) {
        setConfirmPasswordError('Passwords do not match.');
      } else if (formData.confirmPassword) {
        setConfirmPasswordError('');
      }
    }

    // Real-time confirm password validation
    if (field === 'confirmPassword') {
      if (value && value !== formData.password) {
        setConfirmPasswordError('Passwords do not match.');
      } else {
        setConfirmPasswordError('');
      }
    }

    // Clear field errors when user starts typing new values
    if (['email', 'username', 'phoneNumber'].includes(field)) {
      const fieldKey = field as keyof typeof fieldErrors;
      if (fieldErrors[fieldKey]) {
        setFieldErrors(prev => ({ ...prev, [fieldKey]: false }));
      }
    }

    // Debounced real-time checking for email, username, phone
    if (['email', 'username', 'phoneNumber'].includes(field) && value.length > 0) {
      // Clear existing timeout
      if (debounceTimeouts.current[field]) {
        clearTimeout(debounceTimeouts.current[field]);
      }

      // Set new timeout
      debounceTimeouts.current[field] = setTimeout(() => {
        const dbField = field === 'phoneNumber' ? 'phone_number' : field;
        debouncedFieldCheck(dbField as 'email' | 'username' | 'phone_number', value);
      }, 800);
    }
  };

  const showErrorDialog = (title: string, message: string) => {
    setErrorDialogTitle(title);
    setErrorDialogMessage(message);
    setErrorDialogOpen(true);
  };

  const checkFieldExists = async (field: 'email' | 'username' | 'phone_number', value: string) => {
    if (!value) return false;
    
    console.log(`Checking if ${field} exists:`, value);
    
    try {
      const { data, error } = await supabase.rpc('check_user_field_exists', {
        field_name: field,
        field_value: value
      });
      
      console.log(`RPC result for ${field}:`, { data, error });
      
      if (error) {
        console.error(`Error checking ${field}:`, error);
        return false; // Return false on error to allow signup to continue
      }
      
      return data === true;
    } catch (e) {
      console.error(`Exception checking ${field}:`, e);
      return false;
    }
  };

  const debouncedFieldCheck = useCallback(async (field: 'email' | 'username' | 'phone_number', value: string) => {
    if (!value || value.length < 3) {
      // Clear field error when value is too short
      const fieldKey = field === 'phone_number' ? 'phoneNumber' : field;
      setFieldErrors(prev => ({ ...prev, [fieldKey]: false }));
      return;
    }
    
    console.log(`Starting debounced check for ${field}:`, value);
    setCheckingField(field);
    
    try {
      const exists = await checkFieldExists(field, value);
      console.log(`Field ${field} exists:`, exists);
      
      // Update field error state
      const fieldKey = field === 'phone_number' ? 'phoneNumber' : field;
      setFieldErrors(prev => ({ ...prev, [fieldKey]: exists }));
      
      if (exists) {
        if (field === 'email') {
          showErrorDialog('Email Address Taken', 'This email address is already registered. Please use a different email address.');
        } else if (field === 'username') {
          showErrorDialog('Username Taken', 'This username is already taken. Please choose a different username.');
        } else {
          showErrorDialog('Phone Number Taken', 'This phone number is already registered. Please use a different phone number.');
        }
      }
    } catch (error) {
      console.error('Error in debouncedFieldCheck:', error);
    } finally {
      setCheckingField(null);
    }
  }, []);

  const handleBlurCheck = async (field: 'email' | 'username' | 'phone_number', value: string) => {
    const exists = await checkFieldExists(field, value);
    if (exists) {
      if (field === 'email') {
        showErrorDialog('Email Address Taken', 'Email address already taken. Please use another email.');
      } else if (field === 'username') {
        showErrorDialog('Username Taken', 'This username is already taken. Please choose another one.');
      } else {
        showErrorDialog('Phone Number Taken', 'Phone number already taken. Please use another number.');
      }
    }
  };

  const validateForm = () => {
    const { fullName, username, email, phoneNumber, password, confirmPassword } = formData;
    if (!fullName.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter your full name.',
        variant: "destructive",
      });
      return false;
    }
    
    if (!username.trim()) {
      toast({
        title: 'Validation Error', 
        description: 'Please enter a username.',
        variant: "destructive",
      });
      return false;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid email address.',
        variant: "destructive",
      });
      return false;
    }
    
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid phone number.',
        variant: "destructive",
      });
      return false;  
    }
    
    if (!password.trim() || !validatePassword(password)) {
      toast({
        title: 'Validation Error',
        description: 'Password too weak. Use at least 8 characters with uppercase, lowercase, and a number.',
        variant: "destructive",
      });
      return false;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: 'Validation Error', 
        description: 'Passwords do not match.',
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const checkExistingData = async () => {
    // Check username
    const usernameExists = await checkFieldExists('username', formData.username);
    if (usernameExists) {
      showErrorDialog('Username Taken', 'This username is already taken. Please choose another one.');
      return false;
    }

    // Check phone number
    const phoneExists = await checkFieldExists('phone_number', formData.phoneNumber);
    if (phoneExists) {
      showErrorDialog('Phone Number Taken', 'Phone number already taken. Please use another number.');
      return false;
    }

    // Check email
    const emailExists = await checkFieldExists('email', formData.email);
    if (emailExists) {
      showErrorDialog('Email Address Taken', 'Email address already taken. Please use another email.');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setShowLoadingPopup(true);
    
    try {
      // Check for existing data first
      const canContinue = await checkExistingData();
      if (!canContinue) {
        setIsLoading(false);
        setShowLoadingPopup(false);
        return;
      }

      // Call the send-otp edge function
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: {
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          fullName: formData.fullName
        }
      });

      if (error) throw error;

      if (data.success) {
        // Navigate to verification screen with OTP data
        navigate('/verification', {
          state: {
            otp: data.otp, // In production, don't pass this
            email: formData.email,
            phoneNumber: formData.phoneNumber,
            formData: formData
          }
        });
      } else {
        throw new Error(data.error || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      toast({
        title: 'Error',
        description: 'Failed to send verification code. Please try again.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowLoadingPopup(false);
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
      <main className="relative z-10 px-8 py-8 max-w-md mx-auto">
        <div className="animate-fade-in">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">
              Get Started
            </h1>
            <p className="text-gray-600 text-sm">
              Register an account to access our services
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6 no-focus-outline">
            {/* Full Name */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            </div>

            {/* Username */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              {checkingField === 'username' && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              {checkingField === 'email' && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Mobile Number */}
            <div className="relative">
              <Input
                type="tel"
                placeholder="Mobile Number"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Phone className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              {checkingField === 'phone_number' && (
                <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            {/* Referral Code */}
            <div className="relative">
              <Input
                type="text"
                placeholder="Referral Code (Optional)"
                value={formData.referralCode}
                onChange={(e) => handleInputChange('referralCode', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <User className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Key className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1 ml-1">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <Input
                type="password"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className="w-full h-14 pl-4 pr-12 text-lg border border-gray-300 rounded-2xl bg-gray-50 placeholder-gray-500 focus:border-gray-300 focus:ring-0"
              />
              <Key className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black" size={20} />
              {confirmPasswordError && (
                <p className="text-red-500 text-sm mt-1 ml-1">{confirmPasswordError}</p>
              )}
            </div>

            {/* Continue Button */}
            <Button
              type="button"
              onClick={handleContinue}
              disabled={
                isLoading || 
                !validatePassword(formData.password) || 
                formData.password !== formData.confirmPassword || 
                !!passwordError || 
                !!confirmPasswordError ||
                fieldErrors.username ||
                fieldErrors.email ||
                fieldErrors.phoneNumber ||
                checkingField !== null
              }
              className="w-full h-14 fintech-button text-lg font-bold mt-8"
            >
              {isLoading ? (
                  <div className="flex items-center gap-2">
                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                   Processing...
                </div>
              ) : (
                'Continue'
              )}
            </Button>
            
            {/* Terms and Privacy Policy */}
            <div className="text-center mt-3">
              <p className="text-gray-500 text-xs">
                By continuing, you accept Amaksub Data's{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/terms-of-use');
                  }}
                  className="text-primary hover:underline"
                >
                  Terms of Use
                </button>
                {' '}and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/privacy-policy');
                  }}
                  className="text-primary hover:underline"
                >
                  Privacy Policy
                </button>
              </p>
            </div>
          </form>

          {/* Sign in link */}
          <div className="text-center mt-8">
            <span className="text-gray-600">
              Already have an account? 
            </span>
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-semibold ml-1"
            >
              Sign In
            </button>
          </div>
        </div>
        
        {/* Loading Popup */}
        {showLoadingPopup && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="flex flex-col items-center text-center animate-fade-in">
              {/* Logo with spinning animation */}
              <div className="relative mb-4">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden relative">
                  <img 
                    src={amaksubLogo} 
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
      </main>

      <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialogMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialogOpen(false)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default SignUpScreen;