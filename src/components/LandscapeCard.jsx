import React from "react";

export const LandscapeCard = ({ children }) => {
	return (
		<div className="w-full h-40 bg-red-500 mb-2 rounded flex">
			<div className="h-full col p-2 overflow-scroll">{children}</div>
		</div>
	);
};
