import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const SplashScreen = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) return; // Wait for auth to load
      
      // Check for existing session
      if (user) {
        // Check if there's a last visited route to restore
        const lastVisitedRoute = localStorage.getItem('lastVisitedRoute');
        
        if (lastVisitedRoute) {
          // Clear the stored route and navigate to it
          localStorage.removeItem('lastVisitedRoute');
          navigate(lastVisitedRoute);
        } else {
          // No stored route - go to dashboard
          navigate('/dashboard');
        }
      } else {
        // No session - check if it's a first-time user or returning user
        const hasVisitedBefore = localStorage.getItem('has_visited_before');
        
        if (hasVisitedBefore) {
          // Returning user without session - go to login
          navigate('/login');
        } else {
          // First-time user - go to onboarding
          localStorage.setItem('has_visited_before', 'true');
          navigate('/onboarding');
        }
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate, user, loading]);

  return (
    <div className="min-h-screen fintech-depth flex flex-col items-center justify-center relative overflow-hidden">
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 pointer-events-none"></div>
      
      {/* Animated background circles */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
      
      {/* Logo container */}
      <div className="relative z-10 animate-fade-in">
        <div className="w-32 h-32 mb-8 mx-auto glass-effect rounded-full flex items-center justify-center overflow-hidden">
          <img 
            src="/lovable-uploads/b7d5513d-8aa0-410b-b54d-4475a7b2f36f.png" 
            alt="Amaksub Data Logo"
            className="w-28 h-28 object-contain"
          />
        </div>
        
        {/* App name */}
        <h1 className="text-white text-2xl font-bold text-center tracking-wide">
          AMAKSUB DATA
        </h1>
      </div>
      
      {/* Loading indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="w-full h-full bg-white rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;