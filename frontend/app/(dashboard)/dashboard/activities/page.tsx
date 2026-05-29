'use client';
import { useQuery } from '@tanstack/react-query';
import { activitiesApi } from '@/lib/api';
import { Header } from '@/components/layout/Header';
import { RecentActivities } from '@/components/dashboard/RecentActivities';
import { Activity } from '@/types';

export default function ActivitiesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['activities', 'recent'],
    queryFn: () => activitiesApi.getRecent(),
    select: (r) => r.data.data.activities as Activity[],
    refetchInterval: 30 * 1000,
  });

  return (
    <div className="flex flex-col">
      <Header title="Activities" subtitle="Track all team activity and updates" />
      <div className="p-6">
        <RecentActivities activities={data ?? []} isLoading={isLoading} />
      </div>
    </div>
  );
}
