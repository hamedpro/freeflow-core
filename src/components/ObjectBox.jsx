import { JsonViewer } from "@textea/json-viewer";
import React from "react";
const ObjectBox = ({ object }) => {
	if (!object) return null;
	return <JsonViewer value={object} />;
};

export default ObjectBox;
