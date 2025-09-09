import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (emailOrUsername: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            full_name: userData.fullName || userData.full_name,
            username: userData.username,
            phone_number: userData.phoneNumber || userData.phone_number,
          }
        }
      });

      if (error) throw error;

      // If user is created and confirmed, create user profile in users table
      if (data.user && data.user.email_confirmed_at) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: email,
          username: userData.username,
          full_name: userData.fullName || userData.full_name,
          phone_number: userData.phoneNumber || userData.phone_number,
          referral_code: userData.referralCode,
          transaction_pin: userData.transaction_pin || '',
          password_hash: '', // This will be handled by auth
          paystack_account_number: userData.paystack_account_number,
          paystack_account_name: userData.paystack_account_name,
          paystack_bank_name: userData.paystack_bank_name,
          virtual_account_number: userData.virtual_account_number,
          virtual_account_bank: userData.virtual_account_bank,
          balance: 0,
          is_active: true
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
          // Don't throw error here as auth user is already created
        }
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (emailOrUsername: string, password: string) => {
    // Try direct auth first, then fall back to username->email lookup
    const trySignIn = async (email: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    };

    // 1) If it looks like an email, try signing in directly
    if (emailOrUsername.includes('@')) {
      const result = await trySignIn(emailOrUsername);
      if (!result.error) return { error: null };
      // If that fails, we will try username-based lookup as a fallback below
    }

    // 2) Username-based login: map username -> email without blocking login if record is missing
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('email')
        .eq('username', emailOrUsername)
        .maybeSingle();

      if (userData?.email) {
        const result2 = await trySignIn(userData.email);
        if (!result2.error) return { error: null };
      }
    } catch (e) {
      // Swallow lookup errors to avoid blocking auth
      console.warn('Username lookup failed (non-blocking):', e);
    }

    return { error: { message: 'Invalid email address or password. Please try again.' } };
  };

  const signOut = async () => {
    // Clear stored route when signing out
    localStorage.removeItem('lastVisitedRoute');
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};