import React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Button from "./Button"
import { cn } from "../../utils/cn"

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}) {
  if (totalPages <= 1) return null

  // Generate page numbers to display with ellipsis logic
  const getPageNumbers = () => {
    const pages = []
    
    // Always show first page, last page, current page, and one page before/after current
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-8 px-2"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {getPageNumbers().map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground flex items-center justify-center">
              <MoreHorizontal className="h-4 w-4" />
            </span>
          )
        }
        
        return (
          <Button
            key={`page-${page}`}
            variant={currentPage === page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            className={cn("w-8 h-8 p-0", currentPage === page && "bg-primary text-primary-foreground")}
          >
            {page}
          </Button>
        )
      })}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-8 px-2"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
