import React from 'react';
import {SectionData} from "../EditorData";
import styled from "styled-components";


const SectionTitle = styled.div`
  background-color: var(--sn-stylekit-secondary-background-color);
  line-height: 1.4;
  border-bottom: 1px solid var(--sn-stylekit-border-color);
  display: flex;
  align-items: center;
`;

const SectionTitleInput = styled.input`
  background-color: var(--sn-stylekit-secondary-background-color);
  border: none;
  outline: none;
  padding: 10px;
  flex: 1 1 auto;
  color: var(--sn-stylekit-foreground-color);
`;

const SectionTextArea = styled.textarea`
  flex: 1 1 auto;
  background-color: inherit;
  border: none;
  outline: none;
  padding: 10px;
  display: block;
  box-sizing: border-box;
  width: 100%;
  line-height: 1.4;
  resize: none;
  color: var(--sn-stylekit-foreground-color);
`;

const DeleteButton = styled.button`
  border: none;
  outline: none;
  cursor: pointer;
  padding: 0 10px;
  background-color: inherit;

  &:hover {
    background-color: var(--sn-stylekit-secondary-contrast-background-color);
  }
`;

const DragHandle = styled.div`
  cursor: move;
  padding: 0 10px;
`;

interface Params {
  section: SectionData;
  onChange: (e) => void;
  onDelete: () => void;
}

const Section = (params: Params) => {
  const deleteSection = () => {
      params.onDelete();
  };

  return (
    <>
      <SectionTitle>
        <DragHandle>-</DragHandle>
        <SectionTitleInput type="text" name="title" value={params.section.title || ''} onChange={params.onChange}/>
        <DeleteButton onClick={deleteSection}>X</DeleteButton>
      </SectionTitle>
      <SectionTextArea tabIndex={1} name="value" value={params.section.text || ''} onChange={params.onChange}/>
    </>
  );
};

export default Section
