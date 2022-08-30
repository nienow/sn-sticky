import React from 'react';
import {DialogProvider} from "../providers/DialogProvider";
import Editor from "./Editor";

const App = () => {
  return (
    <DialogProvider>
      <Editor/>
    </DialogProvider>
  );
}

export default App
