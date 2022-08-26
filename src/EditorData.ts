export interface EditorData {
  sections: {[key: number]: SectionData};
}

export interface SectionData {
  id?: number;
  index?: number;
  title?: string;
  text?: string;
}
