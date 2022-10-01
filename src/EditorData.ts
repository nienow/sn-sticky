export interface EditorData {
  editor: string;
  version: number;
  sections: { [key: number]: SectionData };
}

export interface SectionData {
  index?: number;
  title?: string;
  text?: string;
}

export const NienowSticky = 'nienow.sticky';
export const NienowGrid = 'nienow.grid';
export const DataVersion = 1;
