import { apiClient } from './client';
import { CreateLoanRequestDto, UpdateLoanRequestDto } from './types';

export type LoanListQuery = {
  communityId?: string;
  status?: string;
  from?: Date;
  to?: Date;
  page?: number;
  pageSize?: number;
};

export const listLoans = (query?: LoanListQuery) =>
  apiClient
    .loansGET(query?.communityId, query?.status, query?.from, query?.to, query?.page, query?.pageSize)
    .then((response) => response?.items ?? []);

export const listLoansPaged = (query?: LoanListQuery) =>
  apiClient.loansGET(query?.communityId, query?.status, query?.from, query?.to, query?.page, query?.pageSize);

export const getLoan = (id: string) => apiClient.loansGET2(id);

export const createLoan = (payload: CreateLoanRequestDto) => apiClient.loansPOST(payload as any);

export const updateLoan = (id: string, payload: UpdateLoanRequestDto) =>
  apiClient.loansPUT(id, payload as any);

export const deleteLoan = (id: string) => apiClient.loansDELETE(id);

export const startLoan = (id: string) => apiClient.start(id);

export const returnLoan = (id: string) => apiClient['return'](id);

export const requestReturn = (id: string) => apiClient.returnRequest(id);

export const confirmReturn = (id: string) => apiClient.returnConfirm(id);

export const cancelReturn = (id: string) => apiClient.returnCancel(id);
