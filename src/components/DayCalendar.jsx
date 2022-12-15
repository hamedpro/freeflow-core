import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { get_tasks } from "../../api/client";
import { get_months_days_count, get_start_and_end, month_names } from "../common";

export const DayCalendar = () => {
	var { user_id } = useParams();
	var [day_tasks, set_day_tasks] = useState(null);
	var [searchParams, setSearchParams] = useSearchParams();
	var tmp = searchParams.get("default");
  if (tmp !== null) {
		var year = Number(tmp.split("-")[0]);
		var month = month_names.indexOf(tmp.split("-")[1]) + 1;
    var day = Number(tmp.split("-")[2]);
	} else {
		var d = new Date();
		var year = d.getUTCFullYear();
		var month = d.getUTCMonth() + 1;
		var day = d.getUTCDate();
	}

  var start_timestamp = Date.UTC(year, month - 1, day);
	var end_timestamp = start_timestamp + 3600 * 1000 * 24;
	async function get_data() {
		var tasks = await get_tasks({
			filters: {
				creator_user_id: user_id,
			},
		});
		set_day_tasks(
			tasks.filter(
				(task) => task.start_date >= start_timestamp && task.end_date <= end_timestamp
			)
		);
	}
	useEffect(() => {
		get_data();
	}, []);
	return (
		<div className="p-2">
			<div>DayCalendar</div>
			<p>
				showing from {start_timestamp} : {new Date(start_timestamp).toDateString()}
			</p>
			<p>
				to {end_timestamp} : {new Date(end_timestamp).toDateString()}
      </p>
      tasks of this day : {
        JSON.stringify(day_tasks)
      }
		</div>
	);
};
