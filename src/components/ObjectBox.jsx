import React, { Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { DataGrid } from "@mui/x-data-grid";
const ObjectBox = ({ object, link = null, onClick = () => {} }) => {
	//onClick prop will be executed before navigating to the given link
	var nav = useNavigate();
	if (!object) return null;

	var rows = Object.keys(object).map((key, index) => {
		return {
			id: index,
			col1: key,
			col2: JSON.stringify(object[key]),
		};
	});

	var columns = [
		{
			field: "col1",
			headerName: "key",
			width: 150,
		},
		{
			field: "col2",
			headerName: "value",
			width: 450,
		},
	];
	return (
		<div
			onClick={() => {
				onClick();
				if (link !== null) {
					nav(link);
				}
			}}
			className="px-2 rounded cursor-pointer my-2"
			style={{height : 300 , width : "100%"}}
		>
			<DataGrid rows={rows} columns={columns} />
		</div>
	);
};

export default ObjectBox;
