import React from 'react';
import { Button } from "../../components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "../../components/Layout";
import { CheckCircle2 } from 'lucide-react';
import Lottie from 'react-lottie-player';

// Simple success animation data
const successAnimation = {
  v: "5.7.1",
  fr: 30,
  ip: 0,
  op: 60,
  w: 300,
  h: 300,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check Mark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        p: { a: 0, k: [150, 150, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { 
          a: 1, 
          k: [
            { t: 0, s: [0, 0], e: [100, 100] },
            { t: 20, s: [100, 100] }
          ] 
        },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  c: false,
                  v: [[-50, 0], [0, 50], [50, -50]],
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]]
                }
              },
              nm: "Path 1"
            },
            {
              ty: "st",
              c: { a: 0, k: [0.03, 0.37, 0.2] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 20 },
              lc: 2,
              lj: 2,
              nm: "Stroke 1"
            },
            {
              ty: "tr",
              p: { a: 0, k: [0, 0] },
              a: { a: 0, k: [0, 0] },
              s: { a: 0, k: [100, 100] },
              r: { a: 0, k: 0 },
              o: { a: 0, k: 100 }
            }
          ],
          nm: "Shape 1"
        }
      ]
    }
  ]
};

export const RequestThankYou = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { description, peopleCount, allergens, pickupDate, pickupTime } = location.state || {};
  
  // Format date for display
  const formatDate = (date: Date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long', 
      month: 'long',
      day: 'numeric'
    });
  };
  
  const handleGoHome = () => {
    navigate('/receive');
  };
  
  const handleMakeAnotherRequest = () => {
    navigate('/request/new');
  };

  return (
    <Layout>
      <div className="p-6 max-w-md mx-auto text-center">
        <div className="mb-8 pt-4">
          <Lottie
            loop={false}
            animationData={successAnimation}
            play
            style={{ width: 200, height: 200, margin: '0 auto' }}
          />
          <h1 className="text-2xl font-bold mb-4 text-[#085f33]">Request Submitted!</h1>
          <p className="text-gray-600 mb-8">
            Thank you for your request. We'll notify nearby donors and update you when your request is fulfilled.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-medium mb-4">Request Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Description</span>
                <p className="font-medium">{description || "No description provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">People to feed</span>
                <p className="font-medium">{peopleCount || 1}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Delivery time</span>
                <p className="font-medium">
                  {pickupDate ? formatDate(pickupDate) : "No date specified"}, {pickupTime || "No time specified"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleGoHome}
              className="w-full h-12 rounded-full text-lg transition-colors bg-[#085f33] hover:bg-[#064726] text-white"
            >
              Return to Dashboard
            </Button>
            <Button 
              onClick={handleMakeAnotherRequest}
              variant="outline"
              className="w-full h-12 rounded-full text-lg border-[#085f33] text-[#085f33] hover:bg-[#f0f9f5]"
            >
              Make Another Request
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}; 