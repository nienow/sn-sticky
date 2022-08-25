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

const TEST_CONTENT = {
  sections: [
    {title: 'Title 1', text: 'Text 1', index: 0},
    {title: 'Title 2', text: 'Text 2', index: 1},
    {title: 'Title 3', text: 'Text 3', index: 2},
    {title: 'Title 4', text: 'Text 4', index: 3},
    {title: 'Title 5', text: 'Text 5', index: 4}
  ]
};

let draggingEl;
let draggingIndex;
let draggingSection;
let targetIndex;
let targetEl;
let noteWidth = 0;
let numColumns = 0;

const Editor = () => {
  const [data, setData] = useState<EditorData>({sections: [{}]});
  const [editorKit, setEditorKit] = useState(null);
  const sectionRefs = useRef([]);
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
    if (contentRef.current && sectionRefs.current[1]) {
      console.log('handle resize');
      const totalWidth = contentRef.current.clientWidth-10;
      numColumns = Math.floor(totalWidth / 300);
      noteWidth = totalWidth / numColumns - 10;
      sectionRefs.current.forEach((ref) => {
        if (ref.current) {
          const index = ref.current.getAttribute('data-index');
          ref.current.style.width = noteWidth + 'px';
          ref.current.style.transform = 'translate(' + ((noteWidth + 10) * (index % numColumns)) +'px, ' + 210 * Math.floor(index / numColumns) + 'px)';
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
  }, [sectionRefs.current]);

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
    sectionRefs.current = parsedData.sections.map((_element, i) => sectionRefs.current[i] ?? createRef());
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

  const onDragStart = (section, index, e) => {
    const el = e.target;
    // const clone = el.cloneNode(true);
    // clone.style.display = 'none';
    // el.insertAdjacentElement('beforebegin', clone);
    draggingEl = el;
    draggingIndex = index;
    draggingSection = section;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    const newTargetEl = e.currentTarget;
    const newTargetIndex = newTargetEl.getAttribute('data-index');

    if (draggingEl !== newTargetEl && newTargetIndex !== targetIndex) {
      targetEl = newTargetEl;
      targetIndex = newTargetIndex;
      console.log('onDragOver');
      const oldDraggingIndex = draggingEl.getAttribute('data-index');
      // targetEl.setAttribute('data-index', oldDraggingIndex);
      // draggingEl.style.transform = 'translate(' + ((noteWidth + 10) * (targetIndex % numColumns)) +'px, ' + 210 * Math.floor(targetIndex / numColumns) + 'px)';

      sectionRefs.current.forEach((ref) => {
        let oldIndex = ref.current.getAttribute('data-index');
        let newIndex = oldIndex;
        if (targetIndex > oldDraggingIndex) {
          if (oldIndex > oldDraggingIndex && oldIndex <= targetIndex) {
            newIndex--;
          }
        } else if (oldIndex < oldDraggingIndex && oldIndex >= targetIndex) {
          newIndex++;
        }
        ref.current.setAttribute('data-index', newIndex);
      });

      draggingEl.setAttribute('data-index', targetIndex);


      handleResize();
    }
  };

  const onDrop = () => {
    sectionRefs.current.forEach((ref) => {
      ref.current.getAttribute('data-index');
    });
  };

  console.log('render');

  return (
    <DialogProvider>
      <EditorContainer>
        <Header data={data} saveNote={saveNote}></Header>
        <EditorContent ref={contentRef}>
          {
            data.sections.map((section, i) => {
              return <EditorSection ref={sectionRefs.current[section.index]} key={i} draggable={true} data-index={i}
                                    onDragStart={(e) => {onDragStart(section, i, e)}}
                                    onDragOver={(e) => {onDragOver(e)}}
                                    onDrop={() => {onDrop()}}>
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
