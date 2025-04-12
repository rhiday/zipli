import { supabase } from './supabase';

const verifyEndpoint = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/verify`;

export const skipPhoneVerification = async (phoneNumber: string) => {
  try {
    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        action: 'skip'
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error skipping phone verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to skip verification'
    };
  }
};

export const sendOTP = async (phoneNumber: string) => {
  try {
    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        action: 'send'
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send OTP'
    };
  }
};

export const verifyOTP = async (phoneNumber: string, otpCode: string) => {
  try {
    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        action: 'check',
        code: otpCode
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return {
      success: data.valid,
      error: null 
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify OTP'
    };
  }
};

export const linkPhoneVerification = async (phoneNumber: string, userId: string) => {
  try {
    const response = await fetch(verifyEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: phoneNumber,
        action: 'link',
        userId: userId
      })
    });

    const data = await response.json();
    if (!data.success) throw new Error(data.error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error linking phone verification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to link phone verification'
    };
  }
};