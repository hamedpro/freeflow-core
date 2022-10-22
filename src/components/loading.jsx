import { LinearProgress } from "@mui/material";
import { StyledDiv } from "../styled_elements";

export function Loading({ is_loading = true, children }) {
	return (
		<>
			{is_loading && (
				<>
					<div className="flex justify-center items-center">
						<StyledDiv>{ml({ en: "loading data ...", fa: "بارگزاری اطلاعات..." })}</StyledDiv>
						<LinearProgress />
					</div>
				</>
			)
			}
			{is_loading !== true &&(
				<>{(()=>children)()}</>
			)}
		</>
	);
}
