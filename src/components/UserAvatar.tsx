import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from '../lib/supabase';
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { LogOut } from 'lucide-react';

export const UserAvatar = (): JSX.Element => {
  const location = useLocation();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationName = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setInitial('');
          return;
        }

        const { data: organization, error } = await supabase
          .from('organizations')
          .select('name')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching organization:', error);
          setError(error.message);
          setInitial('');
          return;
        }

        if (organization?.name) {
          // Just take the first letter of the organization name
          setInitial(organization.name.charAt(0));
        } else {
          setInitial('');
        }
      } catch (error) {
        console.error('Error fetching organization name:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setInitial('');
      }
    };

    fetchOrganizationName();
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Avatar className="w-10 h-10 bg-[#fff0f2] border border-[#085f33] cursor-pointer">
          <AvatarFallback className="bg-[#fff0f2] text-[#085f33] font-medium">
            {initial || '?'}
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        {error && (
          <p className="text-sm text-red-600 px-3 py-2 mb-2">{error}</p>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Log out</span>
        </button>
      </PopoverContent>
    </Popover>
  );
};