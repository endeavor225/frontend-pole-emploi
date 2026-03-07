import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export function AppPagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}) {
  if (totalPages <= 1) return null;

  const renderPages = () => {
    return Array.from(
      { length: Math.min(totalPages, maxVisiblePages) },
      (_, i) => {
        let pageNum;
        if (totalPages <= maxVisiblePages) {
          pageNum = i + 1;
        } else if (currentPage <= Math.ceil(maxVisiblePages / 2)) {
          pageNum = i + 1;
        } else if (
          currentPage >=
          totalPages - Math.floor(maxVisiblePages / 2)
        ) {
          pageNum = totalPages - maxVisiblePages + 1 + i;
        } else {
          pageNum = currentPage - Math.floor(maxVisiblePages / 2) + i;
        }

        return (
          <PaginationItem key={pageNum}>
            <PaginationLink
              onClick={() => {
                window.scrollTo(0, 0);
                onPageChange(pageNum);
              }}
              isActive={pageNum === currentPage}
              className="cursor-pointer"
            >
              {pageNum}
            </PaginationLink>
          </PaginationItem>
        );
      },
    );
  };

  return (
    <div className="mt-8 flex justify-center">
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                onClick={() => {
                  window.scrollTo(0, 0);
                  onPageChange(currentPage - 1);
                }}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}

          {renderPages()}

          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext
                onClick={() => {
                  window.scrollTo(0, 0);
                  onPageChange(currentPage + 1);
                }}
                className="cursor-pointer"
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
