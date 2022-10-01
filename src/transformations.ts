import {DataVersion, EditorData, NienowGrid, NienowSticky, SectionData} from './EditorData';

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
  } else if (data && data.editor === NienowGrid && data.version === 1) {
    return transformFromGrid(data);
  } else {
    return newEditorData();
  }
};

export const transformFromGrid = (data: any): EditorData => {
  const newData: EditorData = {
    editor: NienowSticky,
    version: 1,
    sections: {}
  };

  let id = 0;
  data.sections.forEach(row => {
    row.forEach(section => {
      if (section.title || section.text) {
        const newId = id++;
        newData.sections[newId] = {
          index: newId,
          title: section.title,
          text: section.text
        };
      }
    });
  });
  return newData;
};
