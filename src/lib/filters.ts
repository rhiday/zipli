import { DonationItem, SupabaseDonation } from '../types/donation';

// Helper function to extract pickup time regardless of format
const getPickupTime = (donation: DonationItem | SupabaseDonation): string => {
  if ('pickupTime' in donation && donation.pickupTime) {
    return donation.pickupTime.split('until ')[1] || '';
  }
  if ('pickup_time' in donation && donation.pickup_time) {
    return donation.pickup_time.split('until ')[1] || '';
  }
  return '';
};

// Generic function that works with either type
export const sortDonations = <T extends DonationItem | SupabaseDonation>(donations: T[], filter: string): T[] => {
  const sortedDonations = [...donations];

  switch (filter) {
    case 'amount-desc':
    case 'amount-asc': {
      sortedDonations.sort((a, b) => {
        const amountA = parseFloat(a.quantity.split(' ')[0]) || 0;
        const amountB = parseFloat(b.quantity.split(' ')[0]) || 0;
        return filter === 'amount-desc' ? amountB - amountA : amountA - amountB;
      });
      break;
    }

    case 'distance-asc':
    case 'distance-desc': {
      sortedDonations.sort((a, b) => {
        const distanceA = parseFloat(a.distance.replace('km', '')) || 0;
        const distanceB = parseFloat(b.distance.replace('km', '')) || 0;
        return filter === 'distance-desc' ? distanceB - distanceA : distanceA - distanceB;
      });
      break;
    }

    case 'pickup-asc':
    case 'pickup-desc': {
      sortedDonations.sort((a, b) => {
        const timeA = getPickupTime(a);
        const timeB = getPickupTime(b);
        return filter === 'pickup-desc' 
          ? timeB.localeCompare(timeA)
          : timeA.localeCompare(timeB);
      });
      break;
    }

    default:
      // 'all' - maintain original order
      break;
  }

  return sortedDonations;
};