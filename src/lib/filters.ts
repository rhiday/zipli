import { DonationItem } from '../types/donation';

export const sortDonations = (donations: DonationItem[], filter: string): DonationItem[] => {
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
        const timeA = a.pickupTime.split('until ')[1] || '';
        const timeB = b.pickupTime.split('until ')[1] || '';
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