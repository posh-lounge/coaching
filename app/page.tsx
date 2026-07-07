
import MarketPricePage from '@/components/marketplace-page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Coaching - Peoplematters",
  description: "Coaching peoplematters",
};

export default function Widget() {
 
  return (
    <div className="">
     <MarketPricePage />
    </div>
  );
}
