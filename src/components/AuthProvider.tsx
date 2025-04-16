import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check if short-term session and auto-logout after inactivity
      const sessionPreference = localStorage.getItem('session-preference');
      if (sessionPreference === 'short-term' && session) {
        // Set up activity tracking for auto-logout after 1 hour of inactivity
        let inactivityTimer: number;
        
        const resetInactivityTimer = () => {
          clearTimeout(inactivityTimer);
          inactivityTimer = window.setTimeout(() => {
            // Auto logout after 1 hour of inactivity
            supabase.auth.signOut().then(() => {
              localStorage.removeItem('session-preference');
              window.location.href = '/auth'; // Redirect to login
            });
          }, 60 * 60 * 1000); // 1 hour in milliseconds
        };
        
        // Set initial timer
        resetInactivityTimer();
        
        // Reset timer on user activity
        const activityEvents = ['mousedown', 'keypress', 'scroll', 'touchstart'];
        activityEvents.forEach(event => {
          window.addEventListener(event, resetInactivityTimer);
        });
        
        // Clean up event listeners
        return () => {
          clearTimeout(inactivityTimer);
          activityEvents.forEach(event => {
            window.removeEventListener(event, resetInactivityTimer);
          });
        };
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};