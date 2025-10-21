export type LearningStyle = 'visual' | 'auditory' | 'kinesthetic' | 'reading';

export interface LearningProfile {
  id: string;
  name: string;
  style: LearningStyle;
}

export interface Course {
  id: string;
  name: string;
  semester: string;
  progress?: number;
  units: Unit[];
}

export interface Unit {
  id: string;
  title: string;
  objective?: string;
  topics: Topic[];
}

export interface Topic {
  id: string;
  name: string;
  description?: string;
  learningObjects: Resource[];
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'image' | 'document' | 'external';
  url: string;
  tags?: string[];
  suitability?: Partial<Record<LearningStyle, number>>; // 0-100
  description?: string;
}
