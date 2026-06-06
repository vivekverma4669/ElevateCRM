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

export type CompanySize = 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type EmailStatus = 'sent' | 'opened' | 'clicked';

export interface Company {
  _id: string;
  name: string;
  website?: string;
  industry?: string;
  size?: CompanySize;
  location?: string;
  phone?: string;
  email?: string;
  revenue?: number;
  description?: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Contact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  position?: string;
  company?: Company;
  companyName?: string;
  source: LeadSource;
  tags: string[];
  notes?: string;
  linkedLeads: string[];
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: Pick<User, '_id' | 'name' | 'avatar'>;
  createdBy: Pick<User, '_id' | 'name'>;
  relatedLead?: Pick<Lead, '_id' | 'name' | 'company' | 'status'>;
  relatedContact?: Pick<Contact, '_id' | 'name' | 'email'>;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmailLog {
  _id: string;
  subject: string;
  body: string;
  to: string;
  toName?: string;
  lead?: Pick<Lead, '_id' | 'name' | 'company'>;
  contact?: Pick<Contact, '_id' | 'name' | 'email'>;
  sentBy: string;
  status: EmailStatus;
  trackingId: string;
  openedAt?: string;
  clickedAt?: string;
  openCount: number;
  clickCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStats {
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
}

export interface EmailStats {
  total: number;
  opened: number;
  clicked: number;
  openRate: number;
  clickRate: number;
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
