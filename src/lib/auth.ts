import { supabase } from './supabase';

export interface AuthError {
  message: string;
}

export interface SignUpData {
  organizationName: string;
  contactNumber: string;
  email: string;
  password: string;
  address: string;
}

export const signUp = async (data: SignUpData) => {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // Create organization profile
    const { error: profileError } = await supabase
      .from('organizations')
      .insert([
        {
          id: authData.user.id,
          name: data.organizationName,
          contact_number: data.contactNumber,
          email: data.email,
          address: data.address
        }
      ]);

    if (profileError) throw profileError;

    return { user: authData.user, error: null };
  } catch (error) {
    console.error('SignUp error:', error);
    return {
      user: null,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred during sign up'
      }
    };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    return { session: data.session, error: null };
  } catch (error) {
    console.error('SignIn error:', error);
    return {
      session: null,
      error: {
        message: error instanceof Error ? error.message : 'An error occurred during sign in'
      }
    };
  }
};

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('SignOut error:', error);
    return {
      error: {
        message: error instanceof Error ? error.message : 'An error occurred during sign out'
      }
    };
  }
};