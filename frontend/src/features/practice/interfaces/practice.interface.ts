import { UIFlashcard } from '@/lib/types';

export interface IPracticeViewProps {
  kitId: string;
}

export interface IFlashcardDeckProps {
  kitId: string;
  initialCards: UIFlashcard[];
  onSaveProgress: (updatedCards: UIFlashcard[]) => void;
}
