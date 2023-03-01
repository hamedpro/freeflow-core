import { BackpackRounded, FileDownload, Note, Task } from "@mui/icons-material";
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
				<FileDownload />
				resource : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "tasks") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/tasks/${child._id}`)}>
				<Task />
				task : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "notes") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/notes/${child._id}`)}>
				<Note />
				note : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	} else if (context === "packs") {
		return (
			<LandscapeCard onClick={() => nav(`/dashboard/packs/${child._id}`)}>
				<BackpackRounded />
				pack : {child.title}
				<ObjectBox object={child} />
			</LandscapeCard>
		);
	}
};
