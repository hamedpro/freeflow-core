import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
import { CircleOutlined, CircleRounded } from "@mui/icons-material";
import { useState } from "react";
import "./styles.css";
export function ImageSlider({ image_sources, className = "" }) {
	var [current_image_index, set_current_image_index] = useState(0);
	function image_next() {
		if (current_image_index + 1 <= image_sources.length - 1) {
			set_current_image_index(current_image_index + 1);
		} else {
			set_current_image_index(0);
		}
	}
	function image_back() {
		if (current_image_index - 1 >= 0) {
			set_current_image_index(current_image_index - 1);
		} else {
			set_current_image_index(image_sources.length - 1);
		}
	}
	return (
		<div className={"relative bg-sky-200 h-44 w-full py-1" + " " + className}>
			{image_sources.length !== 0 ? (
				<div className="">
					<div className="absolute w-24 left-1 bottom-1 flex flex-col bg-blue-200 opacity-50 pt-1 rounded">
						<div className="flex justify-between px-1">
							<button onClick={image_back} className="image_change_button">
								<ArrowBackIosNewRoundedIcon fontSize="small" />
							</button>
							<button onClick={image_next} className="image_change_button">
								<ArrowForwardIosRoundedIcon fontSize="small" />
							</button>
						</div>
						<div className="flex px-2 image_change_dots_container">
							{image_sources.map((image_src, index) => {
								return (
									<span key={index}>
										{" "}
										{/* read about react keys in depth becuse may there be a problem when we use index as key */}
										{index == current_image_index ? (
											<CircleRounded sx={{ fontSize: 10 }} />
										) : (
											<CircleOutlined sx={{ fontSize: 10 }} />
										)}
									</span>
								);
							})}
						</div>
					</div>
				</div>
			) : null}

			{image_sources.length !== 0 ? (
				<img
					style={{ objectFit: "contain" }}
					className="h-full mx-auto"
					src={image_sources[current_image_index]}
					alt="product image"
				/>
			) : null}
		</div>
	);
}
