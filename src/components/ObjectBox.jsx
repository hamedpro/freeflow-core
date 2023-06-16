import React from "react";
import { useNavigate } from "react-router-dom";
const ObjectBox = ({ object, link = null, onClick = () => {} }) => {
	//onClick prop will be executed before navigating to the given link
	var nav = useNavigate();
	if (!object) return null;
	return (
		<pre className="overflow-auto break-all w-full">{JSON.stringify(object, undefined, 4)}</pre>
	);
};

export default ObjectBox;
