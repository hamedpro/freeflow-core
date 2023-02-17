import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { GlobalDataContext } from "../GlobalDataContext";
import CommentSBox from "./CommentsBox";
import ObjectBox from "./ObjectBox";

export const Pack = () => {
	var { pack_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	return (
		<>
			<h1>Pack {pack_id}</h1>
			<ObjectBox
				object={global_data.all.packs.find((pack) => pack._id === pack_id)}
				link={`/dashboard/packs/${pack_id}`}
			/>
			<CommentSBox />
		</>
	);
};
