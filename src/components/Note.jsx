import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Attach from "@editorjs/attaches";
import Table from "@editorjs/table";
import ImageTool from "@editorjs/image";
import Checklist from "@editorjs/checklist";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { get_user_notes, update_note } from "../../api/client";
import ObjectBox from "./ObjectBox";
export const Note = () => {
  var { note_id, workspace_id, workflow_id, user_id } = useParams();
  var [note, setNote] = useState(null);
  const editor = new EditorJS({
    holder: "editor-js-div",
    tools: {
      header: {
        class: Header,
        inlineToolbar: true,
      },
      list: {
        class: List,
        inlineToolbar: true,
      },
      attach: {
        class: Attach,
        inlineToolbar: true,
      },
      table: {
        class: Table,
        inlineToolbar: true,
      },
      image: {
        class: ImageTool,
        inlineToolbar: true,
      },
      checklist: {
        class: Checklist,
        inlineToolbar: true,
      },
    },
    data: note,
    defaultBlock: "header",
    autofocus: true,
    placeholder: "Type your text here",
  });
  async function get_data() {
    var tmp = (await get_user_notes({ creator_user_id: user_id })).find(
      (note) => note._id == note_id
    );
    setNote(tmp);
    if (tmp.blocks) {
      // it will just run if blocks is not undefined and also is not null( and also if its an array it should not be empty)
      /* editor js's instance was initialized in mount useEffect
			so render these blocks into that */
      //use tmp.blocks here instead of note.blocks because set_state is async and may note has not changed yet
    }
  }
  useEffect(() => {
    get_data();
  }, []);
  const saveHandler = async () => {
    await update_note({ note_id, update_set: editor.save() });
    //TODO: auto save
  };
  return (
    <div>
      <h1>Note</h1>
      <div>
        <p>workspace_id : {workspace_id}</p>
        <p>workflow_id : {workflow_id}</p>
      </div>
      {note !== null && (
        <>
          <h1>note_data : </h1>
          <ObjectBox object={note} />
        </>
      )}
      <h2>note blocks part</h2>
      <div id='editor-js-div'></div>
      <button onClick={saveHandler}>save</button>
    </div>
  );
};
