export type UserRole = 'admin' | 'sales' | 'user';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';
export type LeadPriority = 'low' | 'medium' | 'high' | 'urgent';
export type LeadSource = 'website' | 'referral' | 'cold_outreach' | 'social' | 'event' | 'other';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: LeadStatus;
  priority: LeadPriority;
  source: LeadSource;
  tags: string[];
  value?: number;
  expectedCloseDate?: string;
  assignedTo?: User;
  createdBy: User;
  description?: string;
  website?: string;
  location?: string;
  lastContactedAt?: string;
  nextFollowUpAt?: string;
  aiSummary?: string;
  aiSentiment?: 'positive' | 'neutral' | 'negative';
  aiUrgency?: 'low' | 'medium' | 'high';
  aiNextAction?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  _id: string;
  type: string;
  title: string;
  description?: string;
  lead: Pick<Lead, '_id' | 'name' | 'company'>;
  user: Pick<User, '_id' | 'name' | 'avatar'>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  _id: string;
  content: string;
  lead: string;
  createdBy: Pick<User, '_id' | 'name' | 'avatar'>;
  isPinned: boolean;
  reminderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalLeads: number;
  newLeadsThisMonth: number;
  leadsGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  wonDeals: number;
  conversionRate: number;
}

export interface PipelineItem {
  status: LeadStatus;
  count: number;
  value: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  deals: number;
}

export interface DashboardData {
  stats: DashboardStats;
  pipeline: PipelineItem[];
  monthlyRevenue: MonthlyRevenue[];
  recentActivities: Activity[];
}

export interface KanbanData {
  [status: string]: Lead[];
}

export interface AILeadSummary {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'low' | 'medium' | 'high';
  nextAction: string;
}

export interface AIEmail {
  subject: string;
  body: string;
}

export interface AISalesInsights {
  hotLeads: string[];
  inactiveClients: string[];
  conversionSuggestions: string[];
  performanceInsights: string[];
  weeklyStrategy: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}
