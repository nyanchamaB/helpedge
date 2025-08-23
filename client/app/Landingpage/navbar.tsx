import React from 'react';
import Link from 'next/link';
import { siteConfig } from '@/config/site';

const Navbar = () => {
  return (
    <nav className="bg-white py-4">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link href="/">
          <img src={siteConfig.logo} alt="Logo" className="h-8" />
        </Link>
        <ul className="flex items-center">
          <li className="mr-6">
            <Link href="#features">Features</Link>
          </li>
          <li className="mr-6">
            <Link href="#resources">Resources</Link>
          </li>
          <li className="mr-6">
            <Link href="#support">Support</Link>
          </li>
          <li>
            <Link href="/auth/login">
             <button className="bg-orange-500 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded">
               Sign Up
            </button>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
