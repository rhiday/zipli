import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { sendOTP, verifyOTP, linkPhoneVerification } from '../../lib/phone';
import { supabase } from '../../lib/supabase';
import { z } from 'zod';
import { Switch } from "../../components/ui/switch";
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { ChevronDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

const TOTAL_STEPS = 3;

const createRegisterSchema = (otpSent: boolean) => z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  organizationName: z.string().min(1, 'Organization name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z.string().min(1, 'Contact number is required'),
  address: z.string().min(1, 'Address is required'),
  role: z.enum(['donor', 'receiver']),
  acceptedInstructions: z.boolean().refine(val => val === true, {
    message: 'You must accept the food donation instructions'
  }),
  otp: otpSent ? z.string().min(6, 'OTP must be 6 digits') : z.string().optional()
});

type RegisterForm = z.infer<ReturnType<typeof createRegisterSchema>>;

export const Register = (): JSX.Element => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState('FI');
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);

  // EU countries + UK
  const EU_COUNTRIES = [
    'AT', // Austria
    'BE', // Belgium
    'BG', // Bulgaria
    'HR', // Croatia
    'CY', // Cyprus
    'CZ', // Czech Republic
    'DK', // Denmark
    'EE', // Estonia
    'FI', // Finland
    'FR', // France
    'DE', // Germany
    'GR', // Greece
    'HU', // Hungary
    'IE', // Ireland
    'IT', // Italy
    'LV', // Latvia
    'LT', // Lithuania
    'LU', // Luxembourg
    'MT', // Malta
    'NL', // Netherlands
    'PL', // Poland
    'PT', // Portugal
    'RO', // Romania
    'SK', // Slovakia
    'SI', // Slovenia
    'ES', // Spain
    'SE', // Sweden
    'GB'  // United Kingdom
  ];

  const countries = getCountries().filter(country => EU_COUNTRIES.includes(country));
  const getCountryEmoji = (country: string) => {
    const codePoints = country
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };
  const getPrefix = (country: string) => `+${getCountryCallingCode(country)}`;
  const [form, setForm] = useState<RegisterForm>({
    email: '',
    password: '',
    organizationName: '',
    contactPerson: '',
    contactNumber: '',
    address: '',
    role: 'donor',
    acceptedInstructions: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
  };

  const handleRoleChange = (checked: boolean) => {
    setForm(prev => ({
      ...prev,
      role: checked ? 'receiver' : 'donor'
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const registerSchema = createRegisterSchema();
      
      const validatedData = registerSchema.parse(form);
      
      // Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/verify?next=/signin`,
          data: {
            role: validatedData.role,
            name: validatedData.organizationName,
            contact_person: validatedData.contactPerson
          }
        }
      });

      if (signUpError) {
        if (signUpError.status === 400 && signUpError.message.includes('already registered')) {
          throw new Error('An account with this email already exists. Please sign in instead.');
        }
        throw signUpError;
      }

      if (!authData.user) throw new Error('No user data returned');
      
      // Show success message and instruct to verify email
      navigate('/auth/verify/pending', {
        state: { email: validatedData.email }
      });
      return;

      // Check if organization already exists
      const { data: existingOrg, error: checkError } = await supabase
        .from('organizations')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means not found
        throw checkError;
      }

      // If organization doesn't exist, create it
      const { error: profileError } = !existingOrg ? await supabase
        .from('organizations')
        .insert({
          id: authData.user.id,
          name: validatedData.organizationName,
          contact_number: `${getPrefix(selectedCountry)}${validatedData.contactNumber.startsWith('0') ? validatedData.contactNumber.slice(1) : validatedData.contactNumber}`,
          email: validatedData.email,
          address: validatedData.address,
          role: validatedData.role,
          contact_person: validatedData.contactPerson,
          created_by: authData.user.id
        })
        .select()
        .single() : { error: null };

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut();
        throw profileError;
      }
      console.log('Created organization profile');

      // Success - navigate based on role
      if (validatedData.role === 'receiver') {
        navigate('/receive');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error instanceof z.ZodError) {
        setError(error.errors[0].message);
      } else {
        setError(
          error instanceof Error 
            ? error.message 
            : 'Failed to create account. Please try again.'
        );
      }

      // If there's an error, try to clean up
      try {
        await supabase.auth.signOut();
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2) {
      if (!form.email || !form.password) {
        setError('Please fill in all fields');
        return;
      }
      if (form.password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
    }
    setError(null);
    if (currentStep === 1 && !form.role) {
      setError('Please select how you would like to use Zipli');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    if (currentStep === 1) {
      navigate(-1);
    } else {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <header className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="text-2xl"
              aria-label="Go back"
            >
              ←
            </button>
            <h1 className="text-2xl font-medium">Create Profile</h1>
          </div>
        </header>

        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full ${
                step <= currentStep ? 'bg-[#085f33]' : 'bg-[#e2e8f0]'
              }`}
            />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {currentStep === 1 && (
            <>
              <h2 className="text-xl font-medium mb-6">How would you like to use Zipli?</h2>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, role: 'donor' }));
                    handleNext();
                  }}
                  className="w-full p-6 text-left border-2 border-[#085f33] rounded-xl hover:bg-[#085f33] hover:text-white transition-colors group"
                >
                  <h3 className="text-lg font-medium mb-2">I want to sell or donate food</h3>
                  <p className="text-sm opacity-80">
                    List your surplus food items for donation or sale
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForm(prev => ({ ...prev, role: 'receiver' }));
                    handleNext();
                  }}
                  className="w-full p-6 text-left border-2 border-[#085f33] rounded-xl hover:bg-[#085f33] hover:text-white transition-colors group"
                >
                  <h3 className="text-lg font-medium mb-2">I want to receive food</h3>
                  <p className="text-sm opacity-80">
                    Browse and collect available food donations
                  </p>
                </button>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must be at least 6 characters
                </p>
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div>
                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name of organization
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  required
                  value={form.organizationName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Organization address
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  value={form.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                />
              </div>

              <div>
                <div className="h-px bg-gray-200 my-6"></div>

                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
                  Contact person
                </label>
                <input
                  id="contactPerson"
                  name="contactPerson"
                  type="text"
                  required
                  value={form.contactPerson}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                />
              </div>

              <div>
                <div className="space-y-2">
                  <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <div className="flex gap-2 items-start">
                    <div className="flex-none">
                      <Popover open={isCountryMenuOpen} onOpenChange={setIsCountryMenuOpen}>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600 flex items-center gap-2 hover:bg-gray-200 transition-colors"
                          >
                            {getCountryEmoji(selectedCountry)}{' '}
                            {getPrefix(selectedCountry)}
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-0 max-h-64 overflow-y-auto">
                          <div className="py-2">
                            {countries.map((country) => (
                              <button
                                key={country}
                                type="button"
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm ${
                                  selectedCountry === country ? 'bg-gray-50' : ''
                                }`}
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setIsCountryMenuOpen(false);
                                }}
                              >
                                {getCountryEmoji(country)}{' '}
                                {country} ({getPrefix(country)})
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex-1">
                      <input
                        id="contactNumber"
                        name="contactNumber"
                        type="tel"
                        required
                        value={form.contactNumber}
                        onChange={handleChange}
                        placeholder="40 1234567"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#085f33] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="acceptedInstructions"
                  name="acceptedInstructions"
                  checked={form.acceptedInstructions}
                  onChange={(e) => setForm(prev => ({
                    ...prev,
                    acceptedInstructions: e.target.checked
                  }))}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#085f33] focus:ring-[#085f33]"
                />
                <label htmlFor="acceptedInstructions" className="text-sm text-gray-600">
                  I have read and commit to the food donation{' '}
                  <a
                    href="https://www.ruokavirasto.fi/en/companies/food-sector/food-donations/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#085f33] hover:underline"
                  >
                    instructions
                  </a>
                  {' '}by the Finnish Food Authority
                </label>
              </div>
            </>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
              {error.includes('already exists') && (
                <Button
                  type="button"
                  onClick={() => navigate('/signin')}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Go to Sign In →
                </Button>
              )}
            </div>
          )}

          {currentStep > 1 && <div className="space-y-4 pt-4">
            {currentStep < TOTAL_STEPS ? (
              <Button 
                type="button"
                onClick={handleNext}
                className="w-full h-12 bg-[#085f33] hover:bg-[#064726] text-white rounded-full text-lg"
              >
                Continue
              </Button>
            ) : (
              <Button 
                type="submit"
                disabled={isLoading}
                className={`w-full h-12 rounded-full text-lg transition-colors ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#085f33] hover:bg-[#064726] text-white'
                }`}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
            )}
          </div>}
        </form>
      </div>
    </Layout>
  );
};