import React from 'react';
import {EditorData} from "../EditorData";
import styled from "styled-components";

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--sn-stylekit-border-color);
`

interface Params {
  data: EditorData;
  addSection: () => void;
}

const Header = (params: Params) => {


  return (
    <HeaderContainer>
      <button onClick={params.addSection}>+ Add</button>
    </HeaderContainer>
  );
}

export default Header
