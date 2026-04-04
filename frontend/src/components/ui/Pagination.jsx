import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button.jsx';

export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(pages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    if (page - delta > 2) {
      range.unshift('...');
    }
    if (page + delta < pages - 1) {
      range.push('...');
    }

    range.unshift(1);
    if (pages !== 1) {
      range.push(pages);
    }

    return range;
  };

  return (
    <div className="flex items-center justify-between px-4 py-4 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          variant="outline"
          className="relative inline-flex items-center"
        >
          Previous
        </Button>
        <Button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          variant="outline"
          className="relative ml-3 inline-flex items-center"
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing Page <span className="font-bold">{page}</span> of{' '}
            <span className="font-bold">{pages}</span>
          </p>
        </div>
        <div>
          <nav
            className="isolate inline-flex -space-x-px rounded-md shadow-sm gap-1"
            aria-label="Pagination"
          >
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              variant="ghost"
              size="sm"
              className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:text-secondary group"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {getPageNumbers().map((n, i) => (
              <button
                key={i}
                onClick={() => n !== '...' && onPageChange(n)}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-black rounded-xl transition-all ${
                  n === page
                    ? 'z-10 bg-secondary text-white shadow-lg shadow-secondary/20 scale-105'
                    : n === '...'
                    ? 'text-gray-400 cursor-default'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 border border-transparent'
                }`}
              >
                {n}
              </button>
            ))}

            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page === pages}
              variant="ghost"
              size="sm"
              className="relative inline-flex items-center px-2 py-2 text-gray-400 hover:text-secondary group"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </Button>
          </nav>
        </div>
      </div>
    </div>
  );
};
