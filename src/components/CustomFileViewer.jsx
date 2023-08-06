import React, { Fragment, useContext, useState } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
import { Section } from "./section"
import { custom_axios_download } from "../../api/client"
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer"
import { Panel } from "primereact/panel"
import ReactAudioPlayer from "react-audio-player"

import ReactPlayer from "react-player"

export const CustomFileViewer = ({ file_id }) => {
    var { cache } = useContext(UnifiedHandlerClientContext)
    var file_meta = cache.find(
        (cache_item) =>
            cache_item.thing.value.file_id === file_id &&
            cache_item.thing.type === "meta"
    )
    if (file_meta === undefined) {
        return "meta of this file couldn't be found."
    }
    var t = file_meta.thing.value.file_mime_type
    var l = new URL(
        `/files/${file_meta.thing.value.file_id}?${
            uhc.jwt && "jwt=" + uhc.jwt
        }`,
        uhc.restful_api_endpoint
    ).href
    if (t.startsWith("video/")) {
        return (
            <ReactPlayer
                url={l}
                controls
            />
        )
    } else if (t.startsWith("audio/")) {
        return (
            <ReactAudioPlayer
                className="w-full"
                src={l}
                controls
            />
        )
    } else if (t.startsWith("image/")) {
        return (
            <img
                src={l}
                width={"100%"}
            />
        )
    } else {
        return (
            <DocViewer
                documents={[{ uri: l }]}
                pluginRenderers={DocViewerRenderers}
            />
        )
    }
}
