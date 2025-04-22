import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog";
import { 
  LayoutDashboard, 
  Compass, 
  Plus, 
  MessageCircle, 
  User,
  Gift,
  HandHeart,
  DollarSign
} from 'lucide-react';

export const BottomNav = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  const getIconColor = (active: boolean) => 
    active ? '#085f33' : '#71717a';

  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-gray-100 max-w-md mx-auto safe-bottom">
      <nav className="h-full grid grid-cols-5 items-center px-2">
        {/* Dashboard */}
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <LayoutDashboard 
            size={24} 
            color={getIconColor(isActive('/'))} 
          />
          <span className={`text-xs ${
            isActive('/') ? 'text-[#085f33]' : 'text-gray-500'
          }`}>
            Dashboard
          </span>
        </button>

        {/* Explore */}
        <button
          onClick={() => navigate('/explore')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <Compass 
            size={24} 
            color={getIconColor(isActive('/explore'))} 
          />
          <span className={`text-xs ${
            isActive('/explore') ? 'text-[#085f33]' : 'text-gray-500'
          }`}>
            Explore
          </span>
        </button>

        {/* Add Button with Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <button className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-[#085f33] rounded-full flex items-center justify-center -mt-4 shadow-lg">
                <Plus size={24} color="white" />
              </div>
              <span className="text-xs text-[#085f33] mt-1">Add</span>
            </button>
          </DialogTrigger>
          <DialogContent className="bottom-16 top-auto !rounded-xl translate-y-0 !max-w-md mx-auto p-0">
            <DialogTitle className="sr-only">Add New Donation or Request</DialogTitle>
            <div className="flex flex-col divide-y divide-gray-100">
              <button
                onClick={() => {
                  navigate('/new-donation');
                }}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 w-full"
              >
                <Gift size={20} className="text-[#085f33]" />
                <div className="text-left">
                  <span className="font-medium">Donate</span>
                  <p className="text-sm text-gray-500">Share surplus food with others</p>
                </div>
              </button>
              <button
                onClick={() => {
                  navigate('/request/new');
                }}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 w-full"
              >
                <HandHeart size={20} className="text-[#085f33]" />
                <div className="text-left">
                  <span className="font-medium">Request</span>
                  <p className="text-sm text-gray-500">Ask for food donations</p>
                </div>
              </button>
              <button
                onClick={() => {
                  // TODO: Implement sell feature
                  navigate('/sell');
                }}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 w-full"
              >
                <DollarSign size={20} className="text-[#085f33]" />
                <div className="text-left">
                  <span className="font-medium">Sell</span>
                  <p className="text-sm text-gray-500">Sell food at a discount</p>
                </div>
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Messages */}
        <button
          onClick={() => navigate('/messages')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <MessageCircle 
            size={24} 
            color={getIconColor(isActive('/messages'))} 
          />
          <span className={`text-xs ${
            isActive('/messages') ? 'text-[#085f33]' : 'text-gray-500'
          }`}>
            Messages
          </span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center justify-center gap-1"
        >
          <User 
            size={24} 
            color={getIconColor(isActive('/profile'))} 
          />
          <span className={`text-xs ${
            isActive('/profile') ? 'text-[#085f33]' : 'text-gray-500'
          }`}>
            Profile
          </span>
        </button>
      </nav>
    </div>
  );
};