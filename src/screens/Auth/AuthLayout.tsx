import React from "react";
import { Outlet } from "react-router-dom";

export const AuthLayout = (): JSX.Element => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff0f2]">
      <div className="w-full max-w-md p-6">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#085f33]">Zipli</h1>
          <p className="text-gray-600">Share food, reduce waste</p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <Outlet />
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Zipli. All rights reserved.
        </div>
      </div>
    </div>
  );
}; 