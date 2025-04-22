import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { AlertTriangle } from "lucide-react";

export const ErrorPage = (): JSX.Element => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-4">Oops! Something went wrong</h1>
        
        <p className="text-gray-600 text-center mb-8">
          We apologize for the inconvenience. An unexpected error has occurred.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={() => navigate(-1)} 
            className="w-full"
            variant="outline"
          >
            Go Back
          </Button>
          
          <Button 
            onClick={() => navigate("/")}
            className="w-full bg-[#085f33] hover:bg-[#064726] text-white"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}; 