import { JsonViewer } from "@rich-data/viewer";
import React from "react";
const ObjectBox = ({ object }) => {
	if (!object) return null;
	return <JsonViewer value={object} indentWidth={20} />;
};

export default ObjectBox;
