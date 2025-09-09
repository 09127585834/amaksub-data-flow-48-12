import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const OnboardingScreen = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: t('welcome'),
      content: t('welcomeDesc')
    },
    {
      title: '',
      content: t('onboarding1')
    },
    {
      title: '',
      content: t('onboarding2')
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    navigate('/signup');
  };

  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="min-h-screen fintech-light relative overflow-hidden">
      {/* Glossy overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-purple-500/10"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-primary/15 rounded-full blur-lg animate-pulse delay-1000"></div>
      
      {/* Header */}
      <header className="relative z-10 p-6 flex justify-end">
        <Button 
          variant="ghost" 
          onClick={handleSkip}
          className="text-primary font-semibold hover:bg-primary/10"
        >
          {t('skip')}
        </Button>
      </header>

      {/* Content */}
      <main className="relative z-10 flex flex-col justify-center items-start px-8 py-16 min-h-[70vh]">
        <div className="w-full max-w-md animate-fade-in">
          {steps[currentStep].title && (
            <h1 className="text-3xl font-bold text-primary mb-6">
              {steps[currentStep].title}
            </h1>
          )}
          
          <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
            {steps[currentStep].content}
          </div>
        </div>
      </main>

      {/* Navigation */}
      <footer className="relative z-10 px-8 pb-8">
        {!isLastStep ? (
          <div className="flex justify-end items-end min-h-[20vh]">
            <Button 
              onClick={handleNext}
              className="fintech-button px-8 py-3 text-lg font-semibold"
            >
              {t('next')}
            </Button>
          </div>
        ) : (
          <div className="flex gap-4 justify-center mt-8">
            <Button 
              onClick={() => navigate('/signup')}
              className="flex-1 max-w-[160px] fintech-button px-6 py-4 text-lg font-bold"
            >
              {t('signUp')}
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="flex-1 max-w-[160px] px-6 py-4 text-lg font-bold border-primary text-primary hover:bg-primary hover:text-white"
            >
              {t('signIn')}
            </Button>
          </div>
        )}
      </footer>

      {/* Step indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentStep ? 'bg-primary w-6' : 'bg-primary/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default OnboardingScreen;