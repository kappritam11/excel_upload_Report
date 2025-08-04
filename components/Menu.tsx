import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import React from 'react';

const Menu: React.FC = () => {
  const router = useRouter();

  return (
    <div>
      <button onClick={() => router.push('/login')}>Home</button>
      <button onClick={() => router.push('/upload')}>Upload</button>
      <button onClick={() => router.push('/report')}>Report</button>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
};

export default Menu;
