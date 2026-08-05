export interface Page {
  id: string;
  title: string;
  icon?: string | null;
  coverImage?: string | null;
  content: string;
  parentId?: string | null;
  tags?: string[];
  isFavorite: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
