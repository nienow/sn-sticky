import React, {createRef, useEffect, useRef, useState} from 'react';
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
  position: relative;
`

const EditorSection = styled.div`
  position: absolute;
  border: 1px solid var(--sn-stylekit-border-color);
  display: flex;
  flex-direction: column;
  width: 300px;
  height: 200px;
  margin: 5px;
`

const TEST_CONTENT: EditorData = {
  sections: {
    1: {title: 'Title 1', text: 'Text 1', index: 0},
    2: {title: 'Title 2', text: 'Text 2', index: 1},
    3: {title: 'Title 3', text: 'Text 3', index: 2},
    4: {title: 'Title 4', text: 'Text 4', index: 3},
    5: {title: 'Title 5', text: 'Text 5', index: 4}
  }
};

let draggingEl;
let draggingSection;
let targetEl;
let targetId;
let noteWidth = 0;
let numColumns = 0;

const Editor = () => {
  const [data, setData] = useState<EditorData>({sections: [{}]});
  const [editorKit, setEditorKit] = useState(null);
  const sectionRefs = useRef({});
  const contentRef = useRef<HTMLDivElement>();

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

  const handleResize = () => {
    if (contentRef.current && sectionRefs.current) {
      console.log('handle resize');
      const totalWidth = contentRef.current.clientWidth-10;
      numColumns = Math.floor(totalWidth / 300);
      noteWidth = totalWidth / numColumns - 10;
      Object.entries(data.sections).forEach(([sectionId,section]) => {
        const sectionRef = sectionRefs.current[sectionId]?.current;
        if (sectionRef) {
          sectionRef.style.width = noteWidth + 'px';
          sectionRef.style.transform = 'translate(' + ((noteWidth + 10) * (section.index % numColumns)) +'px, ' + 210 * Math.floor(section.index / numColumns) + 'px)';
        }
      });
    }
  };

  useEffect(() => {
    console.log('add event listener');
    // Add event listener
    window.addEventListener("resize", handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => {
      console.log('remove event listener');
      window.removeEventListener("resize", handleResize)
    };
  }, [data]);

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
    Object.keys(parsedData.sections).forEach(key => {
      sectionRefs.current[key] = sectionRefs.current[key] ?? createRef()
    });
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

  const handleDelete = (sectionId) => {
    delete data.sections[sectionId];
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

  const onDragStart = (sectionId, e) => {
    const el = e.target;
    // const clone = el.cloneNode(true);
    // clone.style.display = 'none';
    // el.insertAdjacentElement('beforebegin', clone);
    draggingEl = el;
    // draggingIndex = index;
    draggingSection = sectionId;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    const newTargetEl = e.currentTarget;
    const newTargetId = newTargetEl.getAttribute('data-id');

    if (draggingEl !== newTargetEl && newTargetId !== targetId) {
      targetEl = newTargetEl;
      targetId = newTargetId;
      console.log('onDragOver');
      const oldDraggingIndex = data.sections[draggingEl.getAttribute('data-id')].index;
      const targetIndex = data.sections[targetEl.getAttribute('data-id')].index;
      // targetEl.setAttribute('data-index', oldDraggingIndex);
      // draggingEl.style.transform = 'translate(' + ((noteWidth + 10) * (targetIndex % numColumns)) +'px, ' + 210 * Math.floor(targetIndex / numColumns) + 'px)';


      Object.values(data.sections).forEach(section => {
        let oldIndex = section.index;
        let newIndex = oldIndex;
        if (targetIndex > oldDraggingIndex) {
          if (oldIndex > oldDraggingIndex && oldIndex <= targetIndex) {
            newIndex--;
          }
        } else if (oldIndex < oldDraggingIndex && oldIndex >= targetIndex) {
          newIndex++;
        }
        section.index = newIndex;
      });

      data.sections[draggingSection].index = targetIndex;
      console.log(targetIndex);

      handleResize();
    }
  };

  const onDrop = () => {
    draggingEl = undefined;
    draggingSection = undefined;
    targetEl = undefined;
    targetId = undefined;
    saveNote();
  };

  console.log('render');

  return (
    <DialogProvider>
      <EditorContainer>
        <Header data={data} saveNote={saveNote}></Header>
        <EditorContent ref={contentRef}>
          {
            Object.keys(data.sections).map((sectionId) => {
              return <EditorSection ref={sectionRefs.current[sectionId]} key={sectionId} draggable={true} data-id={sectionId}
                                    onDragStart={(e) => {onDragStart(sectionId, e)}}
                                    onDragOver={(e) => {onDragOver(e)}}
                                    onDrop={() => {onDrop()}}>
                  {
                    <Section section={data.sections[sectionId]} onDelete={() => handleDelete(sectionId)} onChange={(e) => handleInputChange(e, sectionId)}></Section>
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
