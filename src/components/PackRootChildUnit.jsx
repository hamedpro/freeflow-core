import { useNavigate } from "react-router-dom";
import { LandscapeCard } from "./LandscapeCard";
import ObjectBox from "./ObjectBox";
export const PackRootChildUnit = ({ context, child }) => {
	//context can be any unit except "events"
	//child is a mongo db document (that unit )

	var nav = useNavigate();

	if (context === "resources") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/resources/${child._id}`)}>
				<i className="bi-cloud-download-fill"></i>
				resource : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "tasks") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/tasks/${child._id}`)}>
				<i className="bi-clipboard-fill"></i>
				task : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "notes") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/notes/${child._id}`)}>
				<i className="bi-card-text"></i>
				note : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "packs") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/packs/${child._id}`)}>
				<i className="bi-box-fill"></i>
				pack : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	}
};
