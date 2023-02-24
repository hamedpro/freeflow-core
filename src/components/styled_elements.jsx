export function StyledDiv({ onClick = () => {}, children, className = "" }) {
	var default_className =
		"text-lg border border-blue-900 bg-blue-600 hover:bg-blue-700 duration-200 text-white rounded px-1 cursor-pointer ";
	return (
		<div onClick={onClick} className={[default_className, className].join(" ")}>
			{children}
		</div>
	);
}
export function StyledInput({
	onClick = () => {},
	className = "",
	id = undefined,
	placeholder = "",
	type = "text",
	textarea_mode = false,
	onChange = () => {},
}) {
	var default_className = "border border-stone-600 rounded px-1";
	return (
		<>
			{textarea_mode ? (
				<textarea
					type={type}
					placeholder={placeholder}
					id={id}
					onClick={onClick}
					className={[default_className, className].join(" ")}
					onChange={onChange}
				/>
			) : (
				<input
					type={type}
					placeholder={placeholder}
					id={id}
					onClick={onClick}
					className={[default_className, className].join(" ")}
					onChange={onChange}
				/>
			)}
		</>
	);
}
