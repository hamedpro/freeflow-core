import React from "react";

export const DayCalendarTimeBar = ({ items }) => {
	//items must be like this : {text, start_percent , end_percent , style : {color : "white"} , onClick }
	return (
		<div className="w-full bg-red-400 relative " style={{ height: "30px" }}>
			{items.map((item, index) => {
				return (
					<div
						key={item.start_percent}
						style={{
							position: "absolute",
							left: item.start_percent + "%",
							width: item.end_percent - item.start_percent + "%",
							height: "100%",
							overflow: "hidden",
							whiteSpace: "nowrap",
							textOverflow: "ellipsis",
							...item.style,
						}}
						className={`${index !== 0 ? "border-l" : ""} ${
							index !== items.length - 1 ? "border-r" : ""
						} border-stone-400 flex justify-center items-center`}
						onClick={item.onClick}
					>
						{item.text}
					</div>
				);
			})}
		</div>
	);
};
