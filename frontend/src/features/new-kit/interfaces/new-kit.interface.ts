import { GenerationProgress } from '@/lib/types';

export interface INewKitFormData {
  jd: string;
  companyUrl: string;
  days: number;
}

export interface IGenerationStepperProps {
  progress?: GenerationProgress;
  companyName?: string;
}

export interface IFailureStateProps {
  title?: string;
  message: string;
  code?: string;
  onRetry?: () => void;
  isPartialWarning?: boolean;
}
