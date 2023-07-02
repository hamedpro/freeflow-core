//this file exists because using
//jsx inside common_helpers.js causes SyntaxError when being used by node
import { renderToString } from "react-dom/server";
import html_react_parser from "html-react-parser";
import editorjs_to_html from "editorjs-html";
import { Fragment } from "react";
export var custom_editorjs_to_jsx = (exported_data) => {
	//typeof exported_data : complete return value of .save method of editor js

	var custom_editorjs_to_html = editorjs_to_html({
		table: (block) => {
			if (block.data.content.length === 0) return <b>[empty table]</b>;
			return renderToString(
				<table>
					<thead>
						<tr>
							{block.withHeadings &&
								block.data.content[0].map((i, index) => <th key={index}>{i}</th>)}
						</tr>
						<tr>
							{!block.withHeadings &&
								block.data.content[0].map((i, index) => <td key={index}>{i}</td>)}
						</tr>
					</thead>
					<tbody>
						{block.data.content.slice(1, block.data.content.length).map((i, index1) => (
							<tr key={index1}>
								{i.map((i, index2) => (
									<td key={index2}>{i}</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			);
		},
		checklist: (block) => {
			return renderToString(
				<>
					{block.data.items.map((i, index) => (
						<Fragment key={index}>
							<i className={i.checked ? "bi-toggle-on" : "bi-toggle-off"} />
							{i.text}
							<br />
						</Fragment>
					))}
				</>
			);
		},
	});

	return html_react_parser(
		custom_editorjs_to_html
			.parse(exported_data)
			.map((i) => {
				if (typeof i === "string") {
					return i;
				} else {
					return `<p>converting this block to html is not supported yet</p>`;
				}
			})
			.join("")
	);
};
