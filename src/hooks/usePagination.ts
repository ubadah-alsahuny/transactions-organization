import { useMemo, useState } from 'react';

export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function usePagination(initial?: Partial<PaginationState>) {
  const [page, setPage] = useState(initial?.page ?? 1);
  const [limit, setLimit] = useState(initial?.limit ?? 10);
  const [total, setTotal] = useState(initial?.total ?? 0);
  const [totalPages, setTotalPages] = useState(initial?.totalPages ?? 1);

  const setFromApi = (value: PaginationState) => {
    setPage(value.page);
    setLimit(value.limit);
    setTotal(value.total);
    setTotalPages(value.totalPages);
  };

  const goToPage = (next: number) => {
    const clamped = Math.max(1, Math.min(totalPages || 1, next));
    setPage(clamped);
  };

  const nextPage = () => goToPage(page + 1);
  const prevPage = () => goToPage(page - 1);

  const state = useMemo(
    () => ({ page, limit, total, totalPages }),
    [limit, page, total, totalPages]
  );

  return {
    ...state,
    setPage: goToPage,
    setLimit,
    setFromApi,
    nextPage,
    prevPage,
  };
}
