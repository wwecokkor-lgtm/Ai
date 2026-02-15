export type Role = 'user' | 'model';

export interface Message {
  id: string;
  role: Role;
  text: string;
  image?: string; // Base64 string
  isError?: boolean;
  isLoading?: boolean;
}

export enum EducationLevel {
  PRIMARY = 'Primary (Class 1-5)',
  JUNIOR = 'Junior (Class 6-8)',
  SSC = 'Secondary (Class 9-10)',
  HSC = 'Higher Secondary (Class 11-12)',
  ADMISSION = 'University Admission',
  UNIVERSITY = 'University Level'
}

export enum Subject {
  GENERAL = 'General / All Subjects',
  MATH = 'Mathematics',
  HIGHER_MATH = 'Higher Mathematics',
  PHYSICS = 'Physics',
  CHEMISTRY = 'Chemistry',
  BIOLOGY = 'Biology',
  ENGLISH = 'English',
  BANGLA = 'Bangla',
  ICT = 'ICT',
  ACCOUNTING = 'Accounting',
  FINANCE = 'Finance'
}

export interface UserContext {
  level: EducationLevel;
  subject: Subject;
}
