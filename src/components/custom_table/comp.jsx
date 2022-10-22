import "./styles.css"
export function CustomTable({ headerItems, rows, children, className = null }) {
	return (
		<div
			className={
				"custom_table border border-blue-400 bg-blue-300 rounded-lg flex flex-col p-2" +
				(className ? ` ${className}` : ``)
			}
		>
			<table>
				<thead>
					<tr>
						{headerItems.map((headerItem, index) => {
							return <th key={index}>{headerItem}</th>;
						})}
					</tr>
				</thead>
				<tbody>
					{rows.map((row, index) => {
						return (
							<tr key={index} className="border border-blue-400">
								{row.map((cell, index) => {
									return (
										<td className="cutsom_table_cell text-center" key={index} onClick={cell.onClick ? cell.onClick : ()=> alert('this field can not change by you')}>
											{cell.value}
											<span className="after_text opacity-0">(click to modify)</span>
										</td>
									);
								})}
							</tr>
						);
					})}
				</tbody>
			</table>
			<div className="mt-2">{children}</div>
		</div>
	);
}
/* 
how to use it : 
<CustomTable
    headerItems={["id", "name", "lastname"]}
    rows={[
        [
            {
                value: "2",
                onclick: () => {
                    alert(ml({en : "id is clicked",fa: ""}));
                },
            },
            {
                value: "hamed",
                onClick: () => {
                    alert(ml({en : "name is clicked",fa: ""}));
                },
            },
            {
                value: "yaghootpour",
                onClick: () => {
                    alert(ml({en : "lastname is clicked",fa: ""}));
                },
            },
        ],
    ]}
>
    this is what comes after that
</CustomTable>
*/
