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
    {title: 'Title 1', text: 'Text 1'},
    {title: 'Title 2', text: 'Text 2'},
    {title: 'Title 3', text: 'Text 3 '},
    {title: 'Title 4', text: 'Text 4'},
    {title: 'Title 5', text: 'Text 5'}
  ]
};

let draggingEl;
let draggingIndex;
let draggingSection;
let swapped = true;
let targetIndex;
let targetEl;

const Editor = () => {
  const [data, setData] = useState<EditorData>({sections: [{}]});
  const [editorKit, setEditorKit] = useState(null);
  const sectionRefs = useRef([]);


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

  useEffect(() => {
    if (sectionRefs.current[1]) {
      sectionRefs.current.forEach((ref, index) => {
        if (ref.current) {
          ref.current.style.transform = 'translate(' + (310 * (index % 2)) +'px, ' + 210 * Math.floor(index / 2) + 'px)';
        }
      });
    }
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
    console.log(sectionRefs.current);
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
    const clone = el.cloneNode(true);
    clone.style.display = 'none';
    el.insertAdjacentElement('beforebegin', clone);
    draggingEl = el;
    draggingIndex = index;
    draggingSection = section;
  };

  const onDragOver = (e) => {
    e.preventDefault();
    targetEl = e.currentTarget;
    if (draggingEl !== targetEl && swapped) {
      targetIndex = targetEl.getAttribute('data-index');
      swapped = false;
      const { left: _left, top: _top } = draggingEl.getBoundingClientRect();
      const { left, top } = targetEl.getBoundingClientRect();
      const diffLeft = left - _left;
      const diffTop = top - _top;
      const time = .15;

      draggingEl.style.transition = `transform ${time}s`;
      draggingEl.style.transform = `translate3d(${diffLeft}px, ${diffTop}px, 0)`;
      targetEl.style.transition = `transform ${time}s`;
      targetEl.style.transform = `translate3d(${diffLeft * -1}px, ${diffTop * -1}px, 0)`;

      // let timer = setTimeout(() => {
      //   draggingEl.style.transition = '';
      //   draggingEl.style.transform = '';
      //   target.style.transition = '';
      //   target.style.transform = '';
      //   if (diffLeft > 0 || diffTop > 0) {
      //     target.insertAdjacentElement('afterend', draggingEl);
      //   } else {
      //     target.insertAdjacentElement('beforebegin', draggingEl);
      //   }
      //   swapped = true;
      //   clearTimeout(timer);
      // }, time * 1000)
    }
  };

  const onDrop = () => {
    swapped = true;
    // draggingEl.style.transition = '';
    // draggingEl.style.transform = '';
    // targetEl.style.transition = '';
    // targetEl.style.transform = '';
    // console.log(data.sections);
    // data.sections.splice(draggingIndex, 1);
    // console.log(data.sections);
    // // if (draggingIndex < targetIndex) {
    // //   data.sections.splice(targetIndex-1, 0, draggingSection);
    // // } else {
    // //   data.sections.splice(targetIndex, 0, draggingSection);
    // // }
    // saveNote();
  };

  return (
    <DialogProvider>
      <EditorContainer>
        <Header data={data} saveNote={saveNote}></Header>
        <EditorContent>
          {
            data.sections.map((section, i) => {
              return <EditorSection ref={sectionRefs.current[i]} key={i} draggable={true} data-index={i}
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
