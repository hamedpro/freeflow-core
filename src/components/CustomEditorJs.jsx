import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Table from "@editorjs/table";
import Checklist from "@editorjs/checklist";
import React from "react";

import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";

export class CustomEditorJs extends React.Component {
	/* todo make sure this lifecycle if working fine  */
	static contextType = UnifiedHandlerClientContext;
	constructor(props) {
		super(props);
	}
	init_editor_js = () => {
		var editor_js_configs = {
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
				table: {
					class: Table,
					inlineToolbar: true,
				},
				checklist: {
					class: Checklist,
					inlineToolbar: true,
				},
			},
			logLevel: "ERROR",

			defaultBlock: "header",
			autofocus: true,
		};

		this.editor_js_instance = new EditorJS(editor_js_configs);
		this.props.pass_ref(this.editor_js_instance);
		this.refresh_editor();
		/* todo correct this error : 
			editor.js:2 addRange(): The given range isn't in document.
			steps to reproduce :
				open a note and wait a second 
				click "open note commits" button and wait 
				click browser back button and go back
				it shows up there
			*/
	};
	find_note_data = () => {
		return this.context.cache.find((i) => i.thing_id === this.props.note_id).thing.value.data;
	};
	refresh_editor = async () => {
		//todo maybe a js lock is required because this
		//function may be called twice parallel
		var tmp = uhc
			.find_thing_meta(this.props.note_id)
			.thing.value.locks.find((i) => i.path[0] == "data");
		await this.editor_js_instance.isReady;

		//await this.editor_js_instance.readOnly.toggle(false);
		await this.editor_js_instance.readOnly.toggle(
			tmp?.value === undefined || tmp?.value !== uhc.user_id
		);
		this.editor_js_instance.clear();
		if ((tmp = this.find_note_data())) {
			await this.editor_js_instance.render(tmp);
		}
	};
	componentDidMount() {
		this.init_editor_js();
	}
	componentDidUpdate() {
		this.refresh_editor();
	}
	componentWillUnmount() {
		this.editor_js_instance.destroy();
	}
	render() {
		return <div id="editor-js-div" className="px-4" style={{ minHeight: "200px" }} />;
	}
}
