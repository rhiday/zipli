import React from 'react';
import { useNavigate } from 'react-router-dom';

interface BackButtonProps {
  to?: string;
  className?: string;
}

export const BackButton = ({ to, className = '' }: BackButtonProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`text-2xl ${className}`}
      aria-label="Go back"
    >
      ←
    </button>
  );
};