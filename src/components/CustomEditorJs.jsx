import EditorJS from "@editorjs/editorjs"
import Header from "@editorjs/header"
import List from "@editorjs/list"
import Table from "@editorjs/table"
import Checklist from "@editorjs/checklist"
import React, { useContext, useEffect, useRef } from "react"

import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import AsyncLock from "async-lock"

export function CustomEditorJs(props) {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var editor_js_instance = useRef()
    var async_lock = useRef(new AsyncLock())
    var init_editor_js = () => {
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
            onChange: props.onChange,
            defaultBlock: "header",
        }

        editor_js_instance.current = new EditorJS(editor_js_configs)
        props.pass_ref(editor_js_instance.current)
    }
    var note_data = cache.find((i) => i.thing_id === props.note_id).thing.value
        .data || { blocks: [] }
    var tmp = uhc
        .find_thing_meta(props.note_id)
        .thing.value.locks.find((i) => i.path[0] == "data")
    var editor_is_readOnly =
        tmp?.value === undefined || tmp?.value !== uhc.user_id

    var refresh_editor = async () => {
        await editor_js_instance.current.isReady
        await editor_js_instance.current.readOnly.toggle(editor_is_readOnly)
        await editor_js_instance.current.clear()
        await editor_js_instance.current.render(note_data)
    }
    useEffect(() => {
        init_editor_js()
    }, [])
    useEffect(() => {
        async_lock.current.acquire("refresh_editor", refresh_editor)
    }, [JSON.stringify(note_data), editor_is_readOnly])
    return (
        <div
            id="editor-js-div"
            className="px-4"
            style={{ minHeight: "200px" }}
        />
    )
}
