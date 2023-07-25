export const Section = ({
    title,
    children,
    style = {},
    className = "",
    ...other_props
}) => {
    return (
        <div
            className={"p-1" + " " + className}
            style={style}
            {...other_props}
        >
            {title && <h1>{title}</h1>}
            <div className="border border-stone-200 rounded p-2">
                {children}
            </div>
        </div>
    )
}
