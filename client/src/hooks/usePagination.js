import { useState, useMemo, useCallback } from 'react';


const usePagination = (data, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginationData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const items = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);
    const totalItems = data.length;

    // Calculate visible page numbers
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
          range.push(i);
        }
      }

      let prev = 0;
      for (const i of range) {
        if (prev + 1 !== i) {
          rangeWithDots.push('...');
        }
        rangeWithDots.push(i);
        prev = i;
      }

      return rangeWithDots;
    };

    return {
      items,
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalItems),
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      visiblePages: getVisiblePages()
    };
  }, [data, currentPage, itemsPerPage]);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(pageNumber);
  }, [paginationData.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationData.hasPreviousPage]);

  const goToFirstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const goToLastPage = useCallback(() => {
    setCurrentPage(paginationData.totalPages);
  }, [paginationData.totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    ...paginationData,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToLastPage,
    reset
  };
};

// Server-side pagination hook
export const useServerPagination = (initialPage = 1, initialLimit = 10) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(totalItems / limit);
    const offset = (currentPage - 1) * limit;

    return {
      currentPage,
      limit,
      offset,
      totalPages,
      totalItems,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
      startIndex: totalItems > 0 ? offset + 1 : 0,
      endIndex: Math.min(offset + limit, totalItems)
    };
  }, [currentPage, limit, totalItems]);

  const goToPage = useCallback((page) => {
    const pageNumber = Math.max(1, Math.min(page, paginationData.totalPages));
    setCurrentPage(pageNumber);
  }, [paginationData.totalPages]);

  const goToNextPage = useCallback(() => {
    if (paginationData.hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [paginationData.hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (paginationData.hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [paginationData.hasPreviousPage]);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const updateTotalItems = useCallback((total) => {
    setTotalItems(total);
  }, []);

  return {
    ...paginationData,
    loading,
    setLoading,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changeLimit,
    updateTotalItems
  };
};

// Infinite scroll pagination hook
export const useInfiniteScroll = (hasNextPage, loadMore, threshold = 100) => {
  const [loading, setLoading] = useState(false);

  const handleScroll = useCallback(async () => {
    if (loading || !hasNextPage) return;

    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      setLoading(true);
      try {
        await loadMore();
      } finally {
        setLoading(false);
      }
    }
  }, [hasNextPage, loadMore, loading, threshold]);

  return {
    loading,
    handleScroll
  };
};

export default usePagination;