import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ─── Base API ─────────────────────────────────────────────────
export async function apiPost<T = any>(
  path: string,
  body: Record<string, unknown> = {}
): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.success) throw new Error(json.message || 'Request failed');
  return json as T;
}

// ─── Types ────────────────────────────────────────────────────
export interface CoachProfile {
  coach_id: number; user_id: string; display_name: string; tagline: string;
  bio: string; profile_photo: string | null; cover_photo: string | null;
  session_rate: number; rate_with_fee: number; currency: string;
  languages: string; years_experience: number; max_coachees: number;
  location: string; linkedin_url: string; website_url: string;
  coaching_style: string; ideal_coachee: string;
  rating_avg: number; rating_count: number; sessions_total: number;
  response_rate: number; status: string;
  is_featured: number; is_verified: number; is_also_coachee: number;
  coaching_level: string; tags?: string; active_coachees?: number;
}

export interface CoacheeProfile {
  coachee_id: number; user_id: string; display_name: string;
  bio: string; profile_photo: string | null; goals: string;
  location: string; occupation: string; coaching_experience: string;
}

export interface Relationship {
  rel_id: number; coach_id: number; coachee_id: number;
  rel_type: string; status: string;
  sessions_paid: number; sessions_used: number; sessions_remaining: number;
  supervision_focus?: string; display_name: string;
  profile_photo: string | null; tagline?: string;
  session_rate?: number; rate_with_fee?: number; rating_avg?: number;
  tags?: string; unread?: number; unread_messages?: number;
  coach_notes?: string;
}

export interface CoachingSession {
  session_id: number; session_ref: string; rel_id: number;
  coach_id: number; coachee_id: number; title: string;
  session_type: 'online' | 'in_person'; meeting_link: string | null;
  location: string | null; scheduled_at: string; duration_mins: number;
  status: string; agenda: string | null; coach_notes: string | null;
  session_summary: string | null; coachee_reflection: string | null;
  energy_level: number | null; created_at: string;
  coach_name?: string; coachee_name?: string;
  coach_photo?: string | null; coachee_photo?: string | null;
  pending_reschedule?: number;
}

export interface Task {
  task_id: number; task_ref: string; rel_id: number;
  coach_id: number; coachee_id: number; title: string;
  description: string | null; why: string | null; success_criteria: string | null;
  created_by: string; created_by_role: 'coach' | 'coachee';
  due_date: string | null; priority: string; status: string;
  approved_at: string | null; reject_reason: string | null;
  linked_goal_id: number | null; created_at: string;
  coach_name?: string; coachee_name?: string; coachee_photo?: string | null;
  latest_submission?: string; latest_reflection?: string;
  my_submission?: string; coach_feedback?: string; coach_rating?: number;
}

export interface Goal {
  goal_id: number; rel_id: number; coach_id: number; coachee_id: number;
  title: string; description: string | null; why: string | null;
  success_looks_like: string | null; obstacles: string | null;
  category: string | null; target_date: string | null;
  status: string; progress_pct: number; created_at: string;
  achieved_at: string | null;
  coach_name?: string; coachee_name?: string;
  ms_done?: number; ms_total?: number;
  milestones?: Milestone[]; updates?: GoalUpdate[];
}

export interface Milestone {
  milestone_id: number; goal_id: number; title: string;
  due_date: string | null; is_completed: number; completed_at: string | null;
}

export interface GoalUpdate {
  update_id: number; goal_id: number; posted_by: string;
  content: string; progress_pct: number; mood: string | null; created_at: string;
}

export interface Message {
  msg_id: number; rel_id: number; sender_id: string;
  full_name: string;  content: string;
  msg_type: string; is_read: number; created_at: string;
}

export interface Conversation {
  rel_id: number; rel_type: string; sessions_remaining: number; status: string;
  display_name: string; profile_photo: string | null; tagline?: string;
  rating_avg?: number; unread: number; last_message?: string; last_msg_at?: string;
}

export interface Notification {
  notif_id: number; user_id: string; type: string;
  title: string; body: string; link: string; is_read: number; created_at: string;
}

export interface Review {
  review_id: number; session_id: number; coach_id: number; coachee_id: number;
  rating: number; comment: string | null; what_helped: string | null;
  coach_reply: string | null; replied_at: string | null; created_at: string;
  coachee_name?: string; coachee_photo?: string | null;
}

export interface Resource {
  resource_id: number; coach_id: number; title: string;
  description: string | null; type: string; url: string | null;
  tags: string | null; visibility: string; download_count: number;
  created_at: string; coach_name?: string; shares?: number;
}

export interface Badge {
  badge_id: number; name: string; description: string;
  icon: string; type: string; awarded_at?: string;
}

export interface Journal {
  journal_id: number; coach_id: number; rel_id: number | null;
  title: string; content: string; mood: string | null;
  is_private: number; share_with_supervisor: number;
  created_at: string; updated_at: string | null;
}

export interface Earning {
  earning_id: number; coach_id: number; package_id: number;
  amount: number; status: string; created_at: string;
}

export interface Payout {
  payout_id: number; coach_id: number; amount: number;
  method: string; account_info: string; status: string;
  admin_note: string | null; created_at: string;
}

// ─── PUBLIC HOOKS ─────────────────────────────────────────────
export const useMarketplace = (filters?: Record<string, unknown>) =>
  useQuery({
    queryKey: ['marketplace', filters],
    queryFn: () => apiPost<{ coaches: CoachProfile[]; total: number; tags: string[]; page: number }>(
      '/api/coaching/public/marketplace', filters || {}
    ),
  });

export const useCoachPublicProfile = (coachId: number | null) =>
  useQuery({
    queryKey: ['coach-public', coachId],
    enabled: !!coachId,
    queryFn: () => apiPost<{ coach: CoachProfile; availability: any[]; reviews: Review[]; badges: Badge[] }>(
      '/api/coaching/public/coach-profile', { coach_id: coachId }
    ),
  });

// ─── COACH HOOKS ─────────────────────────────────────────────
export const useCoachDashboard = () =>
  useQuery({
    queryKey: ['coach-dashboard'],
    queryFn: () => apiPost<any>('/api/coaching/coach/dashboard', {}),
    refetchInterval: 30000,
  });

export const useCoachProfile = () =>
  useQuery({ queryKey: ['coach-profile'], queryFn: () => apiPost<any>('/api/coaching/coach/profile', { action: 'get' }) });

export const useUpdateCoachProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/profile', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coach-profile'] }); qc.invalidateQueries({ queryKey: ['coach-dashboard'] }); },
  });
};

export const useCoachSessions = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({
    queryKey: ['coach-sessions', filters],
    queryFn: () => apiPost<{ sessions: CoachingSession[] }>('/api/coaching/coach/sessions', { action: 'list', ...filters }),
  });

export const useCoachSessionAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/sessions', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coach-sessions'] }); qc.invalidateQueries({ queryKey: ['coach-dashboard'] }); qc.invalidateQueries({ queryKey: ['coach-coachees'] }); },
  });
};

export const useCoachTasks = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({
    queryKey: ['coach-tasks', filters],
    queryFn: () => apiPost<{ tasks: Task[] }>('/api/coaching/coach/tasks', { action: 'list', ...filters }),
  });

export const useCoachTaskAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/tasks', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coach-tasks'] }); qc.invalidateQueries({ queryKey: ['coach-dashboard'] }); },
  });
};

export const useCoachGoals = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({
    queryKey: ['coach-goals', filters],
    queryFn: () => apiPost<{ goals: Goal[] }>('/api/coaching/coach/goals', { action: 'list', ...filters }),
  });

export const useCoachGoalAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/goals', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coach-goals'] }); qc.invalidateQueries({ queryKey: ['coach-dashboard'] }); },
  });
};

export const useCoachConversations = () =>
  useQuery({ queryKey: ['coach-convos'], queryFn: () => apiPost<{ conversations: Conversation[] }>('/api/coaching/coach/messages', { action: 'list_conversations' }), refetchInterval: 10000 });

export const useCoachMessages = (relId: number | null) =>
  useQuery({ queryKey: ['coach-msgs', relId], enabled: !!relId, queryFn: () => apiPost<{ messages: Message[] }>('/api/coaching/coach/messages', { action: 'get_messages', rel_id: relId }), refetchInterval: 5000 });

export const useCoachSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/messages', { action: 'send', ...d }),
    onSuccess: (_, v: any) => { qc.invalidateQueries({ queryKey: ['coach-msgs', v.rel_id] }); qc.invalidateQueries({ queryKey: ['coach-convos'] }); },
  });
};

export const useCoachEarnings = () =>
  useQuery({ queryKey: ['coach-earnings'], queryFn: () => apiPost<any>('/api/coaching/coach/earnings', { action: 'summary' }) });

export const useRequestPayout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/earnings', { action: 'request_payout', ...d }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-earnings'] }),
  });
};

export const useCoachResources = () =>
  useQuery({ queryKey: ['coach-resources'], queryFn: () => apiPost<{ resources: Resource[] }>('/api/coaching/coach/resources', { action: 'list' }) });

export const useCoachResourceAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/resources', d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-resources'] }),
  });
};

export const useCoachees = (status?: string) =>
  useQuery({ queryKey: ['coach-coachees', status], queryFn: () => apiPost<{ coachees: Relationship[] }>('/api/coaching/coach/coachees', { action: 'list', status }) });

export const useCoacheeAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/coachees', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coach-coachees'] }); qc.invalidateQueries({ queryKey: ['coach-dashboard'] }); },
  });
};

export const useProgressReport = (relId: number | null) =>
  useQuery({ queryKey: ['progress-report', relId], enabled: !!relId, queryFn: () => apiPost<any>('/api/coaching/coach/coachees', { action: 'progress_report', rel_id: relId }) });

export const useJournals = () =>
  useQuery({ queryKey: ['journals'], queryFn: () => apiPost<{ journals: Journal[] }>('/api/coaching/coach/journal', { action: 'list' }) });

export const useJournalAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coach/journal', d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['journals'] }),
  });
};

export const useCoachCompetencies = () =>
  useQuery({ queryKey: ['my-competencies'], queryFn: () => apiPost<{ competencies: any[] }>('/api/coaching/coach/journal', { action: 'competencies' }) });

export const useCoachNotifications = () =>
  useQuery({ queryKey: ['coach-notifs'], queryFn: () => apiPost<{ notifications: Notification[]; unread_count: number }>('/api/coaching/coach/notifications', { action: 'fetch' }), refetchInterval: 15000 });

export const useMarkCoachNotifsRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => apiPost('/api/coaching/coach/notifications', { action: 'mark_all_read' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['coach-notifs'] }) });
};

// ─── COACHEE HOOKS ────────────────────────────────────────────
export const useCoacheeDashboard = () =>
  useQuery({ queryKey: ['coachee-dashboard'], queryFn: () => apiPost<any>('/api/coaching/coachee/dashboard', {}), refetchInterval: 30000 });

export const useCoacheeProfile = () =>
  useQuery({ queryKey: ['coachee-profile'], queryFn: () => apiPost<any>('/api/coaching/coachee/profile', { action: 'get' }) });

export const useUpdateCoacheeProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coachee/profile', { action: 'update', ...d }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coachee-profile'] }); qc.invalidateQueries({ queryKey: ['coachee-dashboard'] }); },
  });
};

export const useCoacheeSessions = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({ queryKey: ['coachee-sessions', filters], queryFn: () => apiPost<{ sessions: CoachingSession[] }>('/api/coaching/coachee/sessions', { action: 'list', ...filters }) });

export const useCoacheeSessionAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coachee/sessions', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coachee-sessions'] }); qc.invalidateQueries({ queryKey: ['coachee-dashboard'] }); },
  });
};

export const useCoacheeTasks = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({ queryKey: ['coachee-tasks', filters], queryFn: () => apiPost<{ tasks: Task[] }>('/api/coaching/coachee/tasks', { action: 'list', ...filters }) });

export const useCoacheeTaskAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coachee/tasks', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coachee-tasks'] }); qc.invalidateQueries({ queryKey: ['coachee-dashboard'] }); },
  });
};

export const useCoacheeGoals = (filters?: { status?: string; rel_id?: number }) =>
  useQuery({ queryKey: ['coachee-goals', filters], queryFn: () => apiPost<{ goals: Goal[] }>('/api/coaching/coachee/goals', { action: 'list', ...filters }) });

export const useCoacheeGoalAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coachee/goals', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coachee-goals'] }); qc.invalidateQueries({ queryKey: ['coachee-dashboard'] }); },
  });
};

export const useCoacheeConversations = () =>
  useQuery({ queryKey: ['coachee-convos'], queryFn: () => apiPost<{ conversations: Conversation[] }>('/api/coaching/coachee/messages', { action: 'list_conversations' }), refetchInterval: 10000 });

export const useCoacheeMessages = (relId: number | null) =>
  useQuery({ queryKey: ['coachee-msgs', relId], enabled: !!relId, queryFn: () => apiPost<{ messages: Message[] }>('/api/coaching/coachee/messages', { action: 'get_messages', rel_id: relId }), refetchInterval: 5000 });

export const useCoacheeSendMessage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/coachee/messages', { action: 'send', ...d }),
    onSuccess: (_, v: any) => { qc.invalidateQueries({ queryKey: ['coachee-msgs', v.rel_id] }); qc.invalidateQueries({ queryKey: ['coachee-convos'] }); },
  });
};

export const useCoacheeResources = (type?: string) =>
  useQuery({ queryKey: ['coachee-resources', type], queryFn: () => apiPost<{ resources: Resource[] }>('/api/coaching/coachee/resources', { action: 'list', type }) });

export const useBuyPackage = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost<{ rel_id: number; amounts: any; sessions_count: number; message: string }>('/api/coaching/coachee/buy-package', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['coachee-dashboard'] }); qc.invalidateQueries({ queryKey: ['coachee-coaches'] }); },
  });
};

export const useCoacheeNotifications = () =>
  useQuery({ queryKey: ['coachee-notifs'], queryFn: () => apiPost<{ notifications: Notification[]; unread_count: number }>('/api/coaching/coachee/notifications', { action: 'fetch' }), refetchInterval: 15000 });

export const useMarkCoacheeNotifsRead = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: () => apiPost('/api/coaching/coachee/notifications', { action: 'mark_all_read' }), onSuccess: () => qc.invalidateQueries({ queryKey: ['coachee-notifs'] }) });
};

// ─── ADMIN HOOKS ─────────────────────────────────────────────
export const useAdminDashboard = (period: string) =>
  useQuery({ queryKey: ['admin-dashboard', period], queryFn: () => apiPost<any>('/api/coaching/admin/dashboard', { period }) });

export const useAdminAction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/admin/actions', d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-dashboard'] }),
  });
};

// ─── COACHEE PROGRESS ─────────────────────────────────────────
export const useCoacheeProgress = (relId: number | null) =>
  useQuery({ queryKey: ['coachee-progress', relId], enabled: !!relId,
    queryFn: () => apiPost<any>('/api/coaching/coachee/progress', { rel_id: relId }) });

export const useCoacheeRelationships = () =>
  useQuery({ queryKey: ['coachee-rels'],
    queryFn: () => apiPost<{ relationships: any[] }>('/api/coaching/coachee/progress', {}) });

// ─── ADMIN EXTRAS ─────────────────────────────────────────────
export const useAdminCoaches = (filters?: Record<string, unknown>) =>
  useQuery({ queryKey: ['admin-coaches', filters],
    queryFn: () => apiPost<{ coaches: any[] }>('/api/coaching/admin/coaches', { action: 'list', ...filters }) });

export const useAdminCoachees = (filters?: Record<string, unknown>) =>
  useQuery({ queryKey: ['admin-coachees', filters],
    queryFn: () => apiPost<{ coachees: any[] }>('/api/coaching/admin/coachees', { action: 'list', ...filters }) });

export const useAdminFinances = (period?: string) =>
  useQuery({ queryKey: ['admin-finances', period],
    queryFn: () => apiPost<any>('/api/coaching/admin/finances', { action: 'overview', period: period ?? '30' }) });

export const useAdminCoachAction = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (d: Record<string, unknown>) => apiPost('/api/coaching/admin/coaches', d),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coaches'] }) });
};
