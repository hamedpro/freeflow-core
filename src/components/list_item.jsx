import { ArrowCircleRightRounded } from "@mui/icons-material";
import React from "react";
export default function ListItem(props) {
	return (
		<div
			className={
				"hamedpro8977_list_item mb-1 flex relative border border-stone-400 rounded-lg mx-2 px-2 py-1 pr-3 bg-blue-500 duration-300 hover:bg-blue-700" +
				(typeof props.className == "undefined" ? "" : ` ${props.className}`) +
				(typeof props.vertical == "undefined" ? "" : props.vertical ? " flex-col" : "") +
				(typeof props.onClick !== "undefined" ? " cursor-pointer" : " cursor-default")
			}
			onClick={typeof props.onClick == "undefined" ? () => {} : props.onClick}
		>
			{typeof props.beforeItems == "undefined" ? (
				<></>
			) : (
				<div className="mr-2">{props.beforeItems}</div>
			)}
			{typeof props.image_src == "undefined" || props.image_src === null ? null : (
				<img src={props.image_src} className="w-1/3 mr-2" />
			)}
			{props.items.map((item, index) => {
				if (props.vertical === true) {
					return (
						<React.Fragment key={index}>
							<h1 className={"mr-1 text-white "}>{item}</h1>
						</React.Fragment>
					);
				}
				return (
					<React.Fragment key={index}>
						{index != 0 ? <span className="text-gray-200">|</span> : null}
						<span className={"mr-1 text-white " + (index != 0 ? "ml-1" : "")}>
							{item}
						</span>
					</React.Fragment>
				);
			})}
			{props.remove_arrow !== true ? (
				<div className="hamedpro8977_icon flex justify-content-center items-center">
					<ArrowCircleRightRounded sx={{ color: "white" }} />{" "}
				</div>
			) : null}
		</div>
	);
}
