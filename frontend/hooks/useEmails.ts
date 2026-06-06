'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { emailsApi } from '@/lib/api';
import { toast } from '@/hooks/useToast';

export function useEmailLogs(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['emails', params],
    queryFn: () => emailsApi.getAll(params),
    select: (r) => r.data,
    staleTime: 15 * 1000,
  });
}

export function useEmailStats() {
  return useQuery({
    queryKey: ['emails', 'stats'],
    queryFn: () => emailsApi.getStats(),
    select: (r) => r.data.data.stats,
    staleTime: 30 * 1000,
  });
}

export function useLogEmail() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => emailsApi.log(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({ title: 'Email logged', description: 'Email recorded with tracking enabled.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to log email.', variant: 'destructive' });
    },
  });
}

export function useDeleteEmailLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => emailsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emails'] });
      toast({ title: 'Email log deleted' });
    },
  });
}
