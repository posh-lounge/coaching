
import SignInForm from '@/components/auth/signIn';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Coaching - Peoplematters",
  description: "Coaching peoplematters",
};


export default function Widget() {
 
  return (
    <div className="">
     <SignInForm />
    </div>
  );
}
