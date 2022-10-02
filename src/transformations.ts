import {DataVersion, EditorData, NienowGrid, NienowSticky, SectionData} from './EditorData';

export const newEditorData = (): EditorData => {
  return {
    editor: NienowSticky,
    version: DataVersion,
    sections: {
      0: {index: 0}
    }
  };
};

export const newNoteData = (): SectionData => {
  return {
    index: 0
  };
};

export const transformEditorData = (text: string): EditorData => {
  if (text) {
    let parsedData: EditorData;
    if (text.indexOf('{') === 0) {
      try {
        parsedData = JSON.parse(text);
        if (parsedData.editor === NienowSticky && parsedData.version === 1) {
          return parsedData;
        } else if (parsedData.editor === NienowGrid && parsedData.version === 1) {
          return transformFromGrid(parsedData);
        }
      } catch {
      }
    }
    return null;
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
