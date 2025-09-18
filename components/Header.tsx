
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-4">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
    </header>
  );
};

export default Header;
