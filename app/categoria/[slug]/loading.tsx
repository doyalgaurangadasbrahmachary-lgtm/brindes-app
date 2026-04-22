import React from 'react';

export default function Loading() {
  // Skeleton Grid (12 placeholders as a good default to fill the screen)
  const skeletons = Array.from({ length: 12 });

  return (
    <div className="py-8 pt-24 md:pt-20 animate-pulse w-full max-w-[1200px] mx-auto px-4">
      {/* Title Skeleton */}
      <div className="h-8 bg-gray-200/50 dark:bg-gray-800/50 rounded w-48 mb-6 ml-0 md:ml-[180px] mx-auto md:mx-0"></div>
      
      {/* Grid Layout (mimics ProductGrid cols) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
        {skeletons.map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            {/* Image Placeholder */}
            <div className="w-full aspect-square bg-gray-200/50 dark:bg-gray-800/50 rounded-lg"></div>
            
            {/* Text Placeholders */}
            <div className="px-2 py-3 flex flex-col gap-2">
               <div className="h-4 bg-gray-200/50 dark:bg-gray-800/50 rounded w-1/3"></div>
               <div className="h-3 bg-gray-200/50 dark:bg-gray-800/50 rounded w-3/4"></div>
               <div className="h-3 bg-gray-200/50 dark:bg-gray-800/50 rounded w-1/2"></div>
            </div>
            
            {/* Button Placeholders */}
            <div className="flex gap-2 px-2 pb-4">
               <div className="h-10 bg-gray-200/50 dark:bg-gray-800/50 rounded-full flex-1"></div>
               <div className="h-10 bg-gray-200/50 dark:bg-gray-800/50 rounded-full w-10"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
