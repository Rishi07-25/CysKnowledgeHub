import { auth } from './firebase';

const BASE = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Topic {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  type: 'ctf' | 'blog' | 'experiment' | 'writeup';
  order: number;
  createdBy: string;
  createdAt: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  topicId: string | Topic;
  content: string;
  coverImage?: string;
  authorUid: string;
  authorName: string;
  status: 'draft' | 'pending' | 'approved' | 'published' | 'rejected';
  rejectionReason?: string;
  order: number;
  tags: string[];
  contentType?: 'markdown' | 'novel';
  excerpt?: string;
  viewCount?: number;
  likeCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DbUser {
  _id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'student' | 'author' | 'admin';
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.getIdToken();
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message ?? `HTTP ${res.status}`);
  return data as T;
}

// ─── Public APIs ──────────────────────────────────────────────────────────────

export const getTopics = (type?: string) => {
  const qs = type ? `?type=${encodeURIComponent(type)}` : '';
  return fetch(`${BASE}/api/topics${qs}`).then((r) => json<{ topics: Topic[] }>(r));
};

/** Returns flat list of published articles across all topics of a given type. */
export const getFeedByType = (type: string) =>
  fetch(`${BASE}/api/topics/feed?type=${encodeURIComponent(type)}`).then((r) =>
    json<{ articles: (Article & { topicId: Pick<Topic, '_id' | 'title' | 'slug' | 'type'> })[] }>(r)
  );

export const getArticlesByTopic = (slug: string) =>
  fetch(`${BASE}/api/topics/${slug}/articles`).then((r) =>
    json<{ topic: Topic; articles: Article[] }>(r)
  );

export const getArticle = (topicSlug: string, articleSlug: string) =>
  fetch(`${BASE}/api/topics/${topicSlug}/articles/${articleSlug}`).then((r) =>
    json<{ topic: Topic; article: Article }>(r)
  );

/** Returns topics with their associated published articles. */
export const getGroupedContent = (type: string) =>
  fetch(`${BASE}/api/topics/grouped?type=${encodeURIComponent(type)}`).then((r) =>
    json<{ topics: (Topic & { articles: Article[] })[] }>(r)
  );

// ─── Author APIs ──────────────────────────────────────────────────────────────

export const getMyArticles = () =>
  authFetch(`${BASE}/api/articles/my`).then((r) => json<{ articles: Article[] }>(r));

export const createArticle = (body: {
  title: string;
  topicId: string;
  content: string;
  coverImage?: string;
  tags?: string[];
  contentType?: 'markdown' | 'novel';
  excerpt?: string;
}) =>
  authFetch(`${BASE}/api/articles`, { method: 'POST', body: JSON.stringify(body) }).then((r) =>
    json<{ article: Article }>(r)
  );

export const updateArticle = (
  id: string,
  body: Partial<{ title: string; topicId: string; content: string; coverImage: string; tags: string[]; contentType: 'markdown' | 'novel'; excerpt: string }>
) =>
  authFetch(`${BASE}/api/articles/${id}`, { method: 'PATCH', body: JSON.stringify(body) }).then((r) =>
    json<{ article: Article }>(r)
  );

export const deleteArticle = (id: string) =>
  authFetch(`${BASE}/api/articles/${id}`, { method: 'DELETE' }).then((r) =>
    json<{ message: string }>(r)
  );

export const submitArticle = (id: string) =>
  authFetch(`${BASE}/api/articles/${id}/submit`, { method: 'PATCH' }).then((r) =>
    json<{ article: Article }>(r)
  );

export const getArticleForEdit = (id: string) =>
  authFetch(`${BASE}/api/articles/${id}`).then((r) => json<{ article: Article }>(r));

/** Create a topic — available to both authors and admins. */
export const createTopic = (body: { title: string; description?: string; type: 'ctf' | 'blog' | 'experiment' | 'writeup' }) =>
  authFetch(`${BASE}/api/topics`, { method: 'POST', body: JSON.stringify(body) }).then((r) =>
    json<{ topic: Topic }>(r)
  );

// ─── Admin APIs ───────────────────────────────────────────────────────────────

export const adminGetUsers = () =>
  authFetch(`${BASE}/api/admin/users`).then((r) => json<{ users: DbUser[] }>(r));

export const adminSetUserRole = (uid: string, role: string) =>
  authFetch(`${BASE}/api/admin/users/${uid}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  }).then((r) => json<{ user: DbUser }>(r));

export const adminGetTopics = () =>
  authFetch(`${BASE}/api/admin/topics`).then((r) => json<{ topics: Topic[] }>(r));

export const adminCreateTopic = (body: { title: string; description?: string; type?: 'ctf' | 'blog' | 'experiment' | 'writeup' }) =>
  authFetch(`${BASE}/api/admin/topics`, { method: 'POST', body: JSON.stringify(body) }).then((r) =>
    json<{ topic: Topic }>(r)
  );

export const adminUpdateTopic = (
  id: string,
  body: Partial<{ title: string; description: string; order: number; type: 'ctf' | 'blog' | 'experiment' | 'writeup' }>
) =>
  authFetch(`${BASE}/api/admin/topics/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  }).then((r) => json<{ topic: Topic }>(r));

/** Admin: reassign an article to a different topic/category. */
export const adminUpdateArticleTopic = (articleId: string, topicId: string) =>
  authFetch(`${BASE}/api/admin/articles/${articleId}/topic`, {
    method: 'PATCH',
    body: JSON.stringify({ topicId }),
  }).then((r) => json<{ article: Article }>(r));

export const adminDeleteTopic = (id: string) =>
  authFetch(`${BASE}/api/admin/topics/${id}`, { method: 'DELETE' }).then((r) =>
    json<{ message: string }>(r)
  );

export const adminGetArticles = (params?: { status?: string; topicId?: string; topicType?: string }) => {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {}).filter(([, v]) => v !== undefined && v !== '')
  );
  const qs = new URLSearchParams(filtered).toString();
  return authFetch(`${BASE}/api/admin/articles${qs ? `?${qs}` : ''}`).then((r) =>
    json<{ articles: Article[] }>(r)
  );
};

export const adminSetArticleStatus = (
  id: string,
  status: string,
  rejectionReason?: string
) =>
  authFetch(`${BASE}/api/admin/articles/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejectionReason }),
  }).then((r) => json<{ article: Article }>(r));

export const adminSetArticleOrder = (id: string, order: number) =>
  authFetch(`${BASE}/api/admin/articles/${id}/order`, {
    method: 'PATCH',
    body: JSON.stringify({ order }),
  }).then((r) => json<{ article: Article }>(r));

// ─── Content Types ────────────────────────────────────────────────────────────

export interface ApiProjectLink {
  label: string;
  url: string;
  type?: string;
}

export interface ApiProject {
  _id: string;
  title: string;
  abstract: string;
  description?: string;
  year?: string;
  batch?: string;
  categories: string[];
  tags: string[];
  links: ApiProjectLink[];
  featured: boolean;
  imageUrl?: string;
  contributors: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiAchievement {
  _id: string;
  title: string;
  type: 'Hackathon' | 'CTF' | 'Coding' | 'Other';
  result: string;
  students: string[];
  date: string;
  description: string;
  images: string[];
  imageUrl?: string;
  rank?: string;
  category?: string;
  eventName?: string;
  link?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiInterviewQuestion {
  statement: string;
  topic: string;
  difficulty: string;
  followUps?: string[];
}

export interface ApiInterviewRound {
  name: string;
  mode: string;
  duration: string;
  platform?: string;
  topics: string[];
  difficulty: string;
  questions: ApiInterviewQuestion[];
  feedback?: string;
  dayOffset?: number;
}

export interface ApiInterviewInsights {
  prepStrategy: string;
  mistakes: string[];
  tips: string[];
  resources: string[];
  timeGap: string;
}

export interface ApiInterview {
  _id: string;
  studentName: string;
  batch: string;
  company: string;
  role: string;
  domain: string;
  type: string;
  result: string;
  difficulty: string;
  rounds: ApiInterviewRound[];
  insights: ApiInterviewInsights;
  date: string;
  views: number;
  helpfulCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiCompany {
  _id: string;
  companyName: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  roles: string[];
  eligibilityCriteria: string;
  salaryPackage: string;
  ctc?: number;
  opportunityType: string[];
  selectionProcess: string[];
  interviewExperience?: string;
  notesTips: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTopicGroup {
  name: string;
  type: 'must-know' | 'good-to-know' | 'tools';
  items: string[];
}

export interface ApiRoadmapStep {
  title: string;
  description: string;
  duration?: string;
  resources: string[];
  topics: ApiTopicGroup[];
}

export interface ApiRoadmap {
  _id: string;
  id: string; // slug e.g. 'SOC_ANALYST'
  title: string;
  subtitle: string;
  steps: ApiRoadmapStep[];
  createdAt: string;
  updatedAt: string;
}

// ─── Content Fetch Functions ──────────────────────────────────────────────────

export const getProjects = (params?: { featured?: boolean; category?: string }) => {
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params ?? {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    )
  ).toString();
  return fetch(`${BASE}/api/projects${qs ? `?${qs}` : ''}`).then((r) =>
    json<ApiProject[]>(r)
  );
};

export const getProject = (id: string) =>
  fetch(`${BASE}/api/projects/${id}`).then((r) => json<ApiProject>(r));

export const getAchievements = (params?: { type?: string }) => {
  const qs = params?.type ? `?type=${encodeURIComponent(params.type)}` : '';
  return fetch(`${BASE}/api/achievements${qs}`).then((r) => json<ApiAchievement[]>(r));
};

export const getInterviews = (params?: { company?: string; domain?: string; result?: string; limit?: number }) => {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)])
  );
  const qs = new URLSearchParams(filtered).toString();
  return fetch(`${BASE}/api/interviews${qs ? `?${qs}` : ''}`).then((r) =>
    json<ApiInterview[]>(r)
  );
};

export const getCompanies = (params?: { industry?: string; opportunityType?: string }) => {
  const filtered = Object.fromEntries(
    Object.entries(params ?? {})
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)])
  );
  const qs = new URLSearchParams(filtered).toString();
  return fetch(`${BASE}/api/companies${qs ? `?${qs}` : ''}`).then((r) =>
    json<ApiCompany[]>(r)
  );
};

export const getRoadmaps = () =>
  fetch(`${BASE}/api/roadmaps`).then((r) =>
    json<Pick<ApiRoadmap, '_id' | 'id' | 'title' | 'subtitle'>[]>(r)
  );

export const getRoadmap = (id: string) =>
  fetch(`${BASE}/api/roadmaps/${id}`).then((r) => json<ApiRoadmap>(r));

// ─── VIDEO HUB API ──────────────────────────────────────────────────────────

export interface Video {
  _id: string;
  video_id: string;
  category: string;
  tag: string;
  title: string;
  description: string;
  author: string;
  author_id: string;
  date: string;
  base_upvotes: number;
  status: string;
  series?: string;      // The '?' means it is optional
  seriesOrder?: number;
}

export const adminGetVideos = async (filters?: { status?: string; category?: string }): Promise<Video[]> => {
  const response = await fetch('http://localhost:5000/api/videos');
  if (!response.ok) throw new Error('Failed to fetch videos');
  
  let data: Video[] = await response.json();
  
  // Filter the data based on dashboard dropdowns
  if (filters?.status) {
    data = data.filter(v => v.status === filters.status);
  }
  if (filters?.category) {
    data = data.filter(v => v.category === filters.category);
  }
  
  return data;
};

export const adminSetVideoStatus = async (id: string, status: string): Promise<Video> => {
  const response = await fetch(`http://localhost:5000/api/videos/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  
  if (!response.ok) throw new Error('Failed to update video status');
  return response.json();
};