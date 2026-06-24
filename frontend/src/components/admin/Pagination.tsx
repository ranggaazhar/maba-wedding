// src/components/admin/Pagination.tsx
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalEntries: number;
  entriesPerPage: number;
  label?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalEntries,
  entriesPerPage,
  label = 'data',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const startEntry = (currentPage - 1) * entriesPerPage + 1;
  const endEntry = Math.min(currentPage * entriesPerPage, totalEntries);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (start === 1) {
        end = maxVisiblePages;
      } else if (end === totalPages) {
        start = totalPages - maxVisiblePages + 1;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 border-t mt-4 text-sm">
      <div className="text-muted-foreground text-xs sm:text-sm">
        Menampilkan <span className="font-semibold text-foreground">{startEntry}</span> hingga{' '}
        <span className="font-semibold text-foreground">{endEntry}</span> dari{' '}
        <span className="font-semibold text-foreground">{totalEntries}</span> {label}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Halaman sebelumnya</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(page)}
            className={`h-8 w-8 p-0 font-medium ${
              currentPage === page
                ? 'bg-ocean-deep hover:bg-ocean-deep/90 text-white border-ocean-deep'
                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
            }`}
          >
            {page}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <span className="sr-only">Halaman berikutnya</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
