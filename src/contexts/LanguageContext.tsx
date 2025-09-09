import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'ha';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    getStarted: 'Get Started',
    registerAccount: 'Register an account to access our services',
    fullName: 'Full Name',
    username: 'Username',
    email: 'Email',
    mobileNumber: 'Mobile Number',
    password: 'Password',
    confirmPassword: 'Confirm Password',
    continue: 'Continue',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign In',
    signUp: 'Sign Up',
    skip: 'Skip',
    next: 'Next',
    welcome: 'Welcome to Amaksub Data',
    welcomeDesc: 'We are a telecommunications company registered to offer services in voices and data transmission. Our service includes mobile data, and airtime (VTU) provisioning',
    onboarding1: 'From purchase to activation in seconds.\nAmaksub Data ensures every delivery is smooth, secure, and on time',
    onboarding2: 'Day or night, our support team is ready for you.\nAmaksub Data ensures your services never stop running',
    referralCode: 'Referral Code (Optional)',
    comingSoon: 'Coming Soon',
    // Login Screen
    welcomeBack: 'Welcome back! Please sign in to your account',
    emailOrUsername: 'Email or Username',
    forgetPassword: 'Forget Password!',
    login: 'Login',
    loggingIn: 'Logging in...',
    dontHaveAccount: "Don't have an account?",
    pleaseWait: 'Please wait...',
    // Forgot Password Screen
    resetYourPassword: 'Reset your password',
    resetPasswordDesc: 'Enter your email address and we\'ll send you a link to reset your password. Don\'t worry, it happens to the best of us!',
    sendResetCode: 'Send Reset Code',
    sending: 'Sending...',
    createAccount: 'Create Account!',
    // Error Messages
    validationError: 'Validation Error',
    loginFailed: 'Login Failed',
    emailRequired: 'Email Required',
    invalidEmail: 'Invalid Email',
    resetFailed: 'Reset Failed',
    error: 'Error',
    okay: 'Okay',
    pleaseEnterBoth: 'Please enter both email/username and password.',
    pleaseEnterEmail: 'Please enter your email address.',
    pleaseEnterValidEmail: 'Please enter a valid email address.',
    unexpectedError: 'An unexpected error occurred. Please try again.',
    failedToSendReset: 'Failed to send reset code',
    // Additional translations for form validation and messages
    processing: 'Processing...',
    termsText: 'By continuing, you accept Amaksub Data\'s',
    termsOfUse: 'Terms of Use',
    and: 'and',
    privacyPolicy: 'Privacy Policy',
    pleaseEnterFullName: 'Please enter your full name.',
    pleaseEnterUsername: 'Please enter a username.',
    pleaseEnterValidPhone: 'Please enter a valid phone number.',
    passwordTooWeak: 'Password too weak. Use at least 8 characters with uppercase, lowercase, and a number.',
    passwordsDoNotMatch: 'Passwords do not match.',
    usernameTaken: 'Username Taken',
    usernameExists: 'This username is already taken. Please choose another one.',
    phoneNumberTaken: 'Phone Number Taken',
    phoneExists: 'Phone number already taken. Please use another number.',
    emailAddressTaken: 'Email Address Taken',
    emailExists: 'Email address already taken. Please use another email.',
    failedToSendOTP: 'Failed to send verification code. Please try again.'
  },
  ha: {
    getStarted: 'Fara',
    registerAccount: 'Yi rajista don samun damar yin amfani da ayyukanmu',
    fullName: 'Cikakken Suna',
    username: 'Sunan Mai Amfani',
    email: 'Imel',
    mobileNumber: 'Lambar Wayar Hannu',
    password: 'Kalmar Sirri',
    confirmPassword: 'Tabbatar da Kalmar Sirri',
    continue: 'Ci gaba',
    alreadyHaveAccount: 'Kana da asusu?',
    signIn: 'Shiga',
    signUp: 'Rajista',
    skip: 'Tsallake',
    next: 'Na gaba',
    welcome: 'Maraba da Amaksub Data',
    welcomeDesc: 'Mu kamfani ne na sadarwa da aka rajista don bayar da ayyuka na murya da watsa bayanai. Ayyukanmu sun hada da bayanan wayar hannu, da samar da lokacin sadarwa (VTU)',
    onboarding1: 'Daga siye zuwa kunna a cikin dakiku kaɗan.\nAmaksub Data tana tabbatar da kowane isar da abu cikin sauƙi, aminci, da kuma a daidai lokacin',
    onboarding2: 'Rana ko dare, ƙungiyar tallafin mu tana shirye domku.\nAmaksub Data tana tabbatar da cewa ayyukanku ba za su taɓa tsayawa ba',
    referralCode: 'Lambar Jagorana (Na Zaɓi)',
    comingSoon: 'Ana Zuwa',
    // Login Screen
    welcomeBack: 'Maraba da komawa! Ka shiga asusunka',
    emailOrUsername: 'Imel ko Sunan Mai Amfani',
    forgetPassword: 'Ka manta da Kalmar Sirri!',
    login: 'Shiga',
    loggingIn: 'Ana Shiga...',
    dontHaveAccount: 'Ba ka da asusu?',
    pleaseWait: 'Ka jira...',
    // Forgot Password Screen
    resetYourPassword: 'Sake saita kalmar sirri',
    resetPasswordDesc: 'Shigar da adireshin imel ka kuma mu za mu aika maka da hanyar sake saita kalmar sirri. Kada ka damu, hakan yana faruwa da mafi kyawn mu!',
    sendResetCode: 'Aika Lambar Sake Saita',
    sending: 'Ana Aikawa...',
    createAccount: 'Ƙirƙira Asusu!',
    // Error Messages
    validationError: 'Kuskuren Tabbatarwa',
    loginFailed: 'Shiga Ya Kasa',
    emailRequired: 'Ana Buƙatar Imel',
    invalidEmail: 'Imel Mara Inganci',
    resetFailed: 'Sake Saita Ya Kasa',
    error: 'Kuskure',
    okay: 'To',
    pleaseEnterBoth: 'Ka shigar da imel/sunan mai amfani da kalmar sirri.',
    pleaseEnterEmail: 'Ka shigar da adireshin imel ka.',
    pleaseEnterValidEmail: 'Ka shigar da ingantaccen adireshin imel.',
    unexpectedError: 'Kuskure wanda ba a zata ya faru. Ka sake gwadawa.',
    failedToSendReset: 'Ya kasa aika lambar sake saita',
    // Additional translations for form validation and messages
    processing: 'Ana Sarrafa...',
    termsText: 'Ta hanyar ci gaba, kana amincewa da sharuɗɗan Amaksub Data',
    termsOfUse: 'Sharuɗɗan Amfani',
    and: 'da',
    privacyPolicy: 'Manufar Sirri',
    pleaseEnterFullName: 'Ka shigar da cikakken sunanka.',
    pleaseEnterUsername: 'Ka shigar da sunan mai amfani.',
    pleaseEnterValidPhone: 'Ka shigar da ingantaccen lambar waya.',
    passwordTooWeak: 'Kalmar sirri ba ta da ƙarfi. Yi amfani da aƙalla haruffa 8 tare da babba, ƙanana, da lamba.',
    passwordsDoNotMatch: 'Kalmomin sirri ba su dace ba.',
    usernameTaken: 'An Ɗauki Sunan Mai Amfani',
    usernameExists: 'An riga an ɗauki wannan sunan mai amfani. Ka zaɓi wani.',
    phoneNumberTaken: 'An Ɗauki Lambar Waya',
    phoneExists: 'An riga an ɗauki lambar waya. Ka yi amfani da wata lamba.',
    emailAddressTaken: 'An Ɗauki Adireshin Imel',
    emailExists: 'An riga an ɗauki adireshin imel. Ka yi amfani da wani imel.',
    failedToSendOTP: 'Ya kasa aika lambar tabbatarwa. Ka sake gwadawa.'
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};