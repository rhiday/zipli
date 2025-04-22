import React from 'react';
import { Layout } from './Layout';

export const LoadingScreen = () => {
  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex gap-2">
          <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
          <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-[#085f33] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </Layout>
  );
};