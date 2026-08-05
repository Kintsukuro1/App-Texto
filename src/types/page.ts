export interface Page {
  id: string;
  title: string;
  icon?: string | null;
  coverImage?: string | null;
  content: string;
  isFavorite: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
