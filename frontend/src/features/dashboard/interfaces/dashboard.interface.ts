import { UIInterviewPrepKit } from '@/lib/types';

export interface IDashboardState {
  kits: UIInterviewPrepKit[];
  isLoading: boolean;
  error: string | null;
}

export interface IKitCardProps {
  kit: UIInterviewPrepKit;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export interface IKitTableProps {
  kits: UIInterviewPrepKit[];
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export interface IEmptyStateProps {
  onCreateClick?: () => void;
}
