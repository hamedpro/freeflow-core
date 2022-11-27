import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { get_start_and_end } from "../common";

export const YearCalendar = () => {
	var { user_id } = useParams();
	var [searchParams, setSearchParams] = useSearchParams();
	var year = searchParams.has("year")
		? Number(searchParams.get("year"))
		: new Date().getUTCFullYear();
	var [filtered_tasks, set_filtered_tasks] = useState(null);
	var date_timestamp = Date.UTC(year);
	var { start, end } = get_start_and_end(date_timestamp, "year");
	async function get_data() {
		var tasks = await get_tasks({
			filters: {
				_id: user_id,
			},
		});
		set_filtered_tasks(tasks.filter((task) => task.start_date > start && task.end_date < end));
	}
	useEffect(() => {
		get_data();
	}, []);
	return (
		<>
			<div>YearCalendar</div>
            <p>selected year : {year}</p>
            <p>task should start and finish between ({start}) and ({end})</p>
            <p>json stringified of filtered_tasks : {JSON.stringify(filtered_tasks) }</p>
		</>
	);
};
