'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '@/lib/api';
import { Lead } from '@/types';
import { toast } from '@/hooks/useToast';

export function useLeads(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ['leads', params],
    queryFn: () => leadsApi.getAll(params),
    select: (r) => r.data,
    staleTime: 30 * 1000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsApi.getOne(id),
    select: (r) => r.data.data.lead as Lead,
    enabled: !!id,
  });
}

export function useKanbanLeads() {
  return useQuery({
    queryKey: ['leads', 'kanban'],
    queryFn: () => leadsApi.getKanban(),
    select: (r) => r.data.data.kanban,
    staleTime: 15 * 1000,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lead>) => leadsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: 'Lead created', description: 'New lead has been added to the pipeline.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to create lead.', variant: 'destructive' });
    },
  });
}

export function useUpdateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lead> }) =>
      leadsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['lead', id] });
      toast({ title: 'Lead updated', description: 'Changes saved successfully.' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update lead.', variant: 'destructive' });
    },
  });
}

export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      leadsApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
  });
}

export function useDeleteLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({ title: 'Lead archived', description: 'Lead moved to archive.' });
    },
  });
}

export function useLeadNotes(leadId: string) {
  return useQuery({
    queryKey: ['notes', leadId],
    queryFn: () => leadsApi.getNotes(leadId),
    select: (r) => r.data.data.notes,
    enabled: !!leadId,
  });
}

export function useLeadActivities(leadId: string) {
  return useQuery({
    queryKey: ['activities', leadId],
    queryFn: () => leadsApi.getActivities(leadId),
    select: (r) => r.data.data.activities,
    enabled: !!leadId,
  });
}
