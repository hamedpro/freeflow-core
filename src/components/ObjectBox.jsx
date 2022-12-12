import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";

const ObjectBox = ({ object, link = null, onClick = () => { } }) => {
	//onClick prop will be executed before navigating to the given link
	var nav = useNavigate();
	if (!object) return null;
	return (
		<div
			onClick={() => {
				onClick()
				if (link !== null) {
					nav(link)
				}
			}}
			className="bg-blue-600 text-white px-2 rounded mx-4 cursor-pointer mt-2 "
		>
			{Object.keys(object).map((key, index) => (
				<Fragment key={index}>
					<span className="break-all">
						{key} : {JSON.stringify(object[key])}
					</span>
					<br />
				</Fragment>
			))}
		</div>
	);
};

export default ObjectBox;
