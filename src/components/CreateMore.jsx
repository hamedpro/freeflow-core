import React, { useEffect, useState } from "react";

export const CreateMore = ({ onchange }) => {
	var [isActive, setIsActive] = useState(false);
	useEffect(() => onchange(isActive), [isActive]);
	return (
		<div onClick={() => setIsActive((prev) => !prev)}>
			<i className={isActive ? "bi-toggle-on" : "bi-toggle-off"} />
			<span>create more</span>
		</div>
	);
};
