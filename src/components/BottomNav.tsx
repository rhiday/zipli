import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  PlusCircle,
  MessageCircle,
  User,
  Gift,
  HandHeart
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

export const BottomNav = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'dashboard';
    if (path === '/explore') return 'explore';
    if (path === '/messages') return 'messages';
    if (path === '/profile') return 'profile';
    return '';
  };

  const handleAddClick = () => {
    setIsAddModalOpen(true);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 max-w-md mx-auto px-6">
        <div className="grid grid-cols-5 h-full">
          <button
            onClick={() => navigate('/')}
            className={`flex flex-col items-center justify-center gap-1 ${
              getActiveTab() === 'dashboard' ? 'text-[#085f33]' : 'text-gray-500'
            }`}
          >
            <Home size={20} />
            <span className="text-xs">Dashboard</span>
          </button>
          
          <button
            onClick={() => navigate('/explore')}
            className={`flex flex-col items-center justify-center gap-1 ${
              getActiveTab() === 'explore' ? 'text-[#085f33]' : 'text-gray-500'
            }`}
          >
            <Search size={20} />
            <span className="text-xs">Explore</span>
          </button>
          
          <button
            onClick={handleAddClick}
            className="flex flex-col items-center justify-center gap-1 text-[#085f33]"
          >
            <PlusCircle size={24} />
            <span className="text-xs">Add</span>
          </button>
          
          <button
            onClick={() => navigate('/messages')}
            className={`flex flex-col items-center justify-center gap-1 ${
              getActiveTab() === 'messages' ? 'text-[#085f33]' : 'text-gray-500'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-xs">Messages</span>
          </button>
          
          <button
            onClick={() => navigate('/profile')}
            className={`flex flex-col items-center justify-center gap-1 ${
              getActiveTab() === 'profile' ? 'text-[#085f33]' : 'text-gray-500'
            }`}
          >
            <User size={20} />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>What would you like to do?</DialogTitle>
            <DialogDescription>Choose an option below</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                navigate('/new-donation');
              }}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#085f33] transition-colors"
            >
              <Gift size={24} className="text-[#085f33]" />
              <span className="text-sm font-medium">Donate Food</span>
            </button>
            <button
              onClick={() => {
                setIsAddModalOpen(false);
                navigate('/request');
              }}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-[#085f33] transition-colors"
            >
              <HandHeart size={24} className="text-[#085f33]" />
              <span className="text-sm font-medium">Request Food</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};