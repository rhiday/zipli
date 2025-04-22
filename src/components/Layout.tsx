import React from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-gray-50 safe-top safe-bottom">
      <div 
        className="max-w-md mx-auto bg-white w-full shadow-lg overflow-y-auto"
        style={{
          minHeight: '100dvh',
          WebkitOverflowScrolling: 'touch'
        }}
      >
        {children}
      </div>
    </div>
  );
};