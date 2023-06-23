import React, { Fragment, useContext, useState } from "react";
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext";
import { Section } from "./section";
import { custom_axios_download } from "../../api/client";
function RenderedMode({ file_meta }) {
	var t = file_meta.thing.value.file_mime_type;
	var l = new URL(
		`/files/${file_meta.thing.value.file_id}?${jwt && "jwt=" + uhc.jwt}`,
		uhc.restful_api_endpoint
	).href;
	if (t.startsWith("audio/")) {
		return (
			<audio controls>
				<source src={l} type={t} />
				your browser doesn't support this audio type
			</audio>
		);
	} else if (t.startsWith("image/")) {
		return <img src={l} />;
	} else {
		return <>rendered mode is not supported for this file type : {t}</>;
	}
}
function ShortMode({ file_meta }) {
	var file_meta_first_tr = uhc.find_first_transaction(file_meta.thing_id);
	var v = file_meta.thing.value;
	return (
		<>
			<h1>original file name : {v.originalFilename}</h1>
			<p>
				uploaded by {file_meta_first_tr.user_id} | at
				{new Date(file_meta_first_tr.time).toString()} | mime type : {v.file_mime_type}
			</p>
		</>
	);
}
export const CustomFileViewer = ({ file_id, download_file_name }) => {
	var { cache } = useContext(UnifiedHandlerClientContext);
	var file_meta = cache.find(
		(cache_item) =>
			cache_item.thing.value.file_id === file_id && cache_item.thing.type === "meta"
	);
	if (file_meta === undefined) {
		return "meta of this file couldn't be found.";
	}
	var [current_tab, set_current_tab] = useState("rendered_mode"); // || "short_mode"
	return (
		<Section title={`file #${file_id}`}>
			<h1>{current_tab}</h1>
			{["rendered_mode", "short_mode"].map((value) => (
				<Fragment key={value}>
					<i
						onClick={() => set_current_tab(value)}
						className={value === current_tab ? "bi-toggle-on" : "bi-toggle-off"}
					/>
					<span>{value}</span>
				</Fragment>
			))}

			<button
				onClick={() =>
					custom_axios_download({
						configured_axios: window.uhc.configured_axios,
						url: `/files/${file_meta.thing.value.file_id}`,
						file_name: download_file_name || `file #${file_meta.thing.value.file_id}`,
					})
				}
			>
				<i className="bi-cloud-download-fill" /> download this resource
			</button>

			{current_tab === "rendered_mode" ? (
				<RenderedMode file_meta={file_meta} />
			) : (
				<ShortMode file_meta={file_meta} />
			)}
		</Section>
	);
};
