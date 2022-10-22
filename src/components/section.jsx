export default function Section(props) {
	return (
		<div
			className={
				"section" + (typeof props.className == "undefined" ? "" : " " + props.className)
			}
		>
			<div className={["border border-blue-400 rounded pb-2"].join(" ")}>
				<div className={["w-full h-8 rounded-t relative bg-blue-400 mb-4"].join(' ')}
				style={(props.top_line_style ? props.top_line_style : {} )}
				> 
					<h1 className="mx-2 top-6 -translate-y-1/2 bg-white border border-blue-600 rounded-lg absolute text-lg px-2">
						{props.title}
					</h1>
					{props.secondary ? (
						<div className="mx-4 top-6 right-0 -translate-y-1/2 absolute text-lg px-2">
							{props.secondary}
						</div>
					) : null}
				</div>
				<div className={ [props.innerClassName !== undefined ? props.innerClassName : ""].join(" ")}>
					{props.children}
				</div>
			</div>
		</div>
	);
}
