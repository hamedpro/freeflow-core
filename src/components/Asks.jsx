import React, { useContext } from "react";
import { GlobalDataContext } from "../GlobalDataContext";
import ObjectBox from "./ObjectBox";

export const Asks = () => {
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	return global_data.user.asks.map((i) => <ObjectBox key={i._id} object={i} />);
};
