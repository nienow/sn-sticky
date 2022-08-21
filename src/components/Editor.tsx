import React, {useEffect, useState} from 'react';
import EditorKit from "@standardnotes/editor-kit";
import Header from "./Header";
import Section from "./Section";
import {EditorData} from "../EditorData";
import {DialogProvider} from "../providers/DialogProvider";
import styled from "styled-components";

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const EditorContent = styled.div`
  padding: 5px;
  display: flex;
  flex-wrap: wrap;
`

const EditorSection = styled.div`
  border: 1px solid var(--sn-stylekit-border-color);
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 200px;
  margin: 5px;
`

const TEST_CONTENT = {
  sections: [
    {title: 'Title 1', text: 'Text 1'},
    {title: 'Title 2', text: 'Text 2'},
    {title: 'Title 3', text: 'Text 3 '},
    {title: 'Title 4', text: 'Text 4'},
    {title: 'Title 5', text: 'Text 5'}
  ]
};

const Editor = () => {
  const [data, setData] = useState<EditorData>({sections: [{}]});
  const [editorKit, setEditorKit] = useState(null);

  useEffect(() => {
    setEditorKit(new EditorKit({
      setEditorRawText: initializeText,
      clearUndoHistory: () => {
      },
      getElementsBySelector: () => []
    }, {
      mode: 'plaintext',
      supportsFileSafe: false
    }));
    initializeText(JSON.stringify(TEST_CONTENT));
  }, []);

  const initializeText = (text) => {
    let parsedData;
    if (text) {
      if (text.indexOf('{') === 0) {
        try {
          parsedData = JSON.parse(text);
        } catch {
        }
      }
    }
    if (!parsedData) {
      parsedData = {rows: 2, columns: 2, sections: [[{text: text || ''}, {}], [{}, {}]]};
    }
    setData(parsedData);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>, section) => {
    const target = event.target;
    const value = target.value;
    if (target.name === "title") {
      data.sections[section].title = value;
    } else {
      data.sections[section].text = value;
    }
    saveNote();
  };

  const handleDelete = (section) => {
    data.sections.splice(section, 1);
    saveNote();
  };

  const saveNote = () => {
    setData({...data});
    const text = JSON.stringify(data);
    try {
      editorKit?.onEditorValueChanged(text);
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  return (
    <DialogProvider>
      <EditorContainer>
        <Header data={data} saveNote={saveNote}></Header>
        <EditorContent>
          {
            data.sections.map((section, i) => {
              return <EditorSection key={i}>
                  {
                    <Section section={section} onDelete={() => handleDelete(i)} onChange={(e) => handleInputChange(e, i)}></Section>
                  }
                </EditorSection>;
            })
          }
        </EditorContent>
      </EditorContainer>
    </DialogProvider>
  );
}

export default Editor
