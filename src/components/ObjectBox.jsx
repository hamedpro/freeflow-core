import React from "react";
import { useNavigate } from "react-router-dom";

const ObjectBox = ({ object, link = null }) => {
	var nav = useNavigate();
	if (!object) return null;
	return (
		<div
			onClick={link !== null ? () => nav(link) : () => {}}
			className="bg-blue-600 text-white px-2 rounded mx-4 cursor-pointer mt-2 "
		>
			{Object.keys(object).map((key, index) => (
				<div key={index}>
					<span>
						{key} : {JSON.stringify(object[key])}
					</span>
					<br />
				</div>
			))}
		</div>
	);
};

export default ObjectBox;
