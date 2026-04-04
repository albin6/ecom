import React from 'react';

export const Loader = () => {
  return (
    <div className="flex justify-center items-center py-12 w-full">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
    </div>
  );
};
