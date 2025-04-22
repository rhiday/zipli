import React, { useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2 } from 'lucide-react';
import Lottie from 'lottie-react';

// Placeholder animation data (replace with your actual animation)
const successAnimation = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 500,
  h: 500,
  nm: "Success Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [250, 250, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] }
      },
      ao: 0,
      shapes: [
        {
          ty: "gr",
          it: [],
          nm: "Group 1",
          np: 2,
          cix: 2,
          bm: 0,
          ix: 1,
          mn: "ADBE Vector Group",
          hd: false
        }
      ],
      ip: 0,
      op: 60,
      st: 0,
      bm: 0
    }
  ]
};

export const VerificationSuccess = (): JSX.Element => {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/signin', { 
        replace: true,
        state: { message: 'Email verified successfully! Please log in.' }
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const navigateToSignIn = () => {
    navigate('/auth', {
      state: { message: 'Email verified successfully! Please log in.' }
    });
  };

  return (
    <Layout>
      <div className="p-6 flex flex-col items-center justify-center min-h-screen">
        <div className="w-24 h-24 bg-[#085f33] rounded-full flex items-center justify-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="text-center">
          <Lottie animationData={successAnimation} loop={false} />
          <h1 className="text-2xl font-bold mb-2">Email Verified!</h1>
          <p className="text-gray-600 mb-8">
            Redirecting you to log in...
          </p>
          <Button 
            onClick={navigateToSignIn}
            className="bg-[#085f33] hover:bg-[#064726] text-white px-6 py-2 rounded-full"
          >
            Continue to Log In
          </Button>
        </div>
      </div>
    </Layout>
  );
};