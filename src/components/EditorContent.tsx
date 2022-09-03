import React, {createRef, useEffect, useRef} from 'react';
import Section from "./Section";
import {EditorData} from "../EditorData";
import styled from "styled-components";

interface Params {
  data: EditorData;
  saveNote: () => void;
  handleDelete: (sectionId) => void;
}

const EditorContentContainer = styled.div`
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
  height: 200px;
  margin: 5px;
`

const DragGhost = styled.div`
  position: fixed;
  top: -300px;
`

let draggingSectionId;
let targetId;

const EditorContent = ({data, saveNote, handleDelete}: Params) => {
  const sectionRefs = useRef({});
  const contentRef = useRef<HTMLDivElement>();
  const ghostRef = useRef<HTMLDivElement>();

  Object.keys(data.sections).forEach(key => {
    sectionRefs.current[key] = sectionRefs.current[key] ?? createRef()
  });

  const handleResize = () => {
    if (contentRef.current && sectionRefs.current) {
      const totalWidth = contentRef.current.clientWidth - 10;
      const numColumns = Math.floor(totalWidth / 300);
      const noteWidth = totalWidth / numColumns - 10;
      Object.entries(data.sections).forEach(([sectionId, section]) => {
        const sectionRef = sectionRefs.current[sectionId]?.current;
        if (sectionRef) {
          sectionRef.style.width = noteWidth + 'px';
          sectionRef.style.transform = 'translate(' + ((noteWidth + 10) * (section.index % numColumns)) + 'px, ' + 210 * Math.floor(section.index / numColumns) + 'px)';
        }
      });
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    handleResize();
    console.log(sectionRefs.current);
    return () => {
      window.removeEventListener("resize", handleResize)
    };
  }, [data]);

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


  const onDragStart = (sectionId, e) => {
    draggingSectionId = sectionId;
    e.dataTransfer.setDragImage(ghostRef.current, 0, 0);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    const newTargetEl = e.currentTarget;
    const newTargetId = newTargetEl.getAttribute('data-id');

    if (draggingSectionId !== newTargetId && newTargetId !== targetId) {
      targetId = newTargetId;
      const oldDraggingIndex = data.sections[draggingSectionId].index;
      const targetIndex = data.sections[targetId].index;

      Object.values(data.sections).forEach(section => {
        let index = section.index;
        if (targetIndex > oldDraggingIndex) {
          if (index > oldDraggingIndex && index <= targetIndex) {
            index--;
          }
        } else if (index < oldDraggingIndex && index >= targetIndex) {
          index++;
        }
        section.index = index;
      });
      data.sections[draggingSectionId].index = targetIndex;
      handleResize();
      targetId = undefined;
    }
  };

  const onDrop = () => {
    draggingSectionId = undefined;
    targetId = undefined;
    saveNote();
  };

  return (
    <EditorContentContainer ref={contentRef}>
      {
        Object.keys(data.sections).map((sectionId) => {
          return <EditorSection ref={sectionRefs.current[sectionId]} key={sectionId} draggable={true} data-id={sectionId}
                                onDragStart={(e) => {
                                  onDragStart(sectionId, e)
                                }}
                                onDragOver={(e) => {
                                  onDragOver(e)
                                }}
                                onDrop={() => {
                                  onDrop()
                                }}>
            {
              <Section section={data.sections[sectionId]} onDelete={() => handleDelete(sectionId)}
                       onChange={(e) => handleInputChange(e, sectionId)}></Section>
            }
          </EditorSection>;
        })
      }
      <DragGhost ref={ghostRef}></DragGhost>
    </EditorContentContainer>
  );
}

export default EditorContent
