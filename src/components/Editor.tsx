import React, {useEffect, useState} from 'react';
import EditorKit from "@standardnotes/editor-kit";
import Header from "./Header";
import {EditorData} from "../EditorData";
import styled from "styled-components";
import EditorContent from "./EditorContent";
import {newEditorData, newNoteData, transformEditorData} from "../transformations";
import Unsupported from "./Unsupported";

const EditorContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`

const App = () => {
  const [data, setData] = useState<EditorData>(undefined);
  const [unsupported, setUnsupported] = useState(false);
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

    // Uncomment to use test data
    // initializeText(TestData);
  }, []);

  const initializeText = (text) => {
    const data = transformEditorData(text);
    if (data) {
      setData(data);
    } else {
      setUnsupported(true);
    }
  };

  const eraseDataAndStartNewNote = () => {
    setUnsupported(false);
    setData(newEditorData());
    saveNote();
  };

  const saveNote = () => {
    const text = JSON.stringify(data);
    try {
      editorKit?.onEditorValueChanged(text);
    } catch (error) {
      console.log('Error saving note:', error);
    }
  };

  const addSection = () => {
    Object.values(data.sections).forEach(section => {
      section.index++;
    });
    const newId = new Date().getTime();
    data.sections[newId] = newNoteData();
    setData({...data});
    saveNote();
  };

  const handleDelete = (sectionId) => {
    const index = data.sections[sectionId].index;
    delete data.sections[sectionId];
    Object.values(data.sections).forEach(section => {
      if (section.index > index) {
        section.index--;
      }
    });
    setData({...data});
    saveNote();
  };

  if (data) {
    return (
      <EditorContainer>
        <Header data={data} addSection={addSection}></Header>
        <EditorContent saveNote={saveNote} data={data} handleDelete={handleDelete}></EditorContent>
      </EditorContainer>
    );
  } else if (unsupported) {
    return (
      <Unsupported eraseFn={eraseDataAndStartNewNote}></Unsupported>
    )
  }
}

export default App
