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
export const DataVersion = 1;

export const newEditorData = (): EditorData => {
  return {
    editor: NienowSticky,
    version: DataVersion,
    sections: {}
  };
};

export const newNoteData = (): SectionData => {
  return {
    index: 0
  };
};

export const transformEditorData = (data: any): EditorData => {
  if (data && data.editor === NienowSticky && data.version === 1) {
    return data;
  } else {
    return newEditorData();
  }
};
