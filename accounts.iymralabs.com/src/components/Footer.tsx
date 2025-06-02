import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              &copy; {currentYear} Iymra Labs. All rights reserved.
            </p>
          </div>
          
          <div className="flex space-x-4">
            <Link to="/terms" className="text-gray-600 dark:text-gray-300 text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-gray-600 dark:text-gray-300 text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
              Privacy Policy
            </Link>
            <Link to="/contact" className="text-gray-600 dark:text-gray-300 text-sm hover:text-indigo-600 dark:hover:text-indigo-400">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;