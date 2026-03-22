
export enum ContentType {
  BLOG = 'BLOG',
  CTF = 'CTF',
  ROADMAP = 'ROADMAP',
  CERTIFICATION = 'CERTIFICATION',
  PROJECT = 'PROJECT',
  EXPERIMENT = 'EXPERIMENT',
  INTERVIEW = 'INTERVIEW',
  COMPANY = 'COMPANY'
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  author: string;
  date: string;
  tags: string[];
  content?: string;
  link?: string;
  imageUrl?: string;
}

export type TopicType = 'must-know' | 'good-to-know' | 'tools';

export interface TopicGroup {
  name: string;
  type: TopicType;
  items: string[];
}

export interface RoadmapStep {
  title: string;
  description: string;
  resources: string[];
  duration?: string;
  topics?: TopicGroup[];
}

export interface RoadmapData {
  id: string;
  title: string;
  subtitle: string;
  steps: RoadmapStep[];
}

export interface InterviewQuestion {
  statement: string;
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  followUps?: string[];
}

export interface InterviewRound {
  name: string;
  mode: 'Online' | 'Offline' | 'Virtual';
  duration: string;
  platform?: string;
  topics: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  questions: InterviewQuestion[];
  feedback?: string;
  dayOffset?: number;
}

export interface InterviewInsights {
  prepStrategy: string;
  mistakes: string[];
  tips: string[];
  resources: string[];
  timeGap: string;
}

export interface InterviewExperience {
  id: string;
  studentName: string;
  batch: string;
  company: string;
  role: string;
  domain: string; // e.g., "Cybersecurity", "Software Engineering", "Cloud"
  type: 'Internship' | 'Full-time' | 'On-campus' | 'Off-campus';
  result: 'Selected' | 'Rejected' | 'Waiting';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  rounds: InterviewRound[];
  insights: InterviewInsights;
  date: string;
  views: number;
  helpfulCount: number;
  tags?: string[];
}

export interface ProjectLink {
  label: string;
  url: string;
  type?: 'github' | 'demo' | 'paper' | 'docs' | 'other';
}

export interface Project {
  id: string;
  title: string;
  abstract: string;
  description?: string;
  year?: string; // e.g. 2023
  batch?: string; // e.g. "VI Sem"
  categories: string[]; // e.g. ['Cyber Forensics', 'VAPT']
  tags?: string[];
  links?: ProjectLink[];
  featured?: boolean; // for showcase top projects
  imageUrl?: string;
  contributors?: string[];
}

export interface Achievement {
  id: string;
  title: string;
  type: 'Hackathon' | 'CTF' | 'Coding' | 'Other';
  result: string;
  students: string[];
  date: string;
  description: string;
  images: string[];
  // Optional fields used by richer achievement cards
  imageUrl?: string;
  rank?: string;
  category?: string;
  eventName?: string;
  link?: string;
}

export interface CompanyInfo {
  id: string;
  companyName: string;
  logo: string;
  industry: string;
  location: string;
  website: string;
  roles: string[];
  eligibilityCriteria: string;
  salaryPackage: string;
  ctc?: number;
  opportunityType?: ('Internship' | 'Placement')[];
  selectionProcess: string[];
  interviewExperience?: string;
  notesTips: string;
}

export type PublicationKind = 'Paper' | 'Patent' | 'Book Chapter' | 'Poster';
export type VenueType = 'Conference' | 'Journal' | 'Workshop' | 'Symposium' | 'Other';

export interface Publication {
  id: string;
  title: string;
  kind: PublicationKind;
  publicationDate: string;
  venue: string;
  publisher: string;
  venueType: VenueType;
  isInternational: boolean;
  abstract: string;
  keywords?: string[];
  authors: string[];
  link?: string;
}
