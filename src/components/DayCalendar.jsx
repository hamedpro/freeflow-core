import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { get_tasks } from "../../api/client";
import { get_start_and_end } from "../common";

export const DayCalendar = () => {
  var {user_id} = useParams()
  var [day_tasks,set_day_tasks ] = useState(null)
	var [searchParams, setSearchParams] = useSearchParams();
  var d = new Date(searchParams.has("timestamp") ? searchParams.get('timestamp') : new Date().getTime())
  //if there is a timestamp present in the url => filters will show results that are in that day that timestamp is in that
  var year = d.getUTCFullYear()
  var month = d.getUTCMonth()
  var day = d.getUTCDay()
  var { start, end } = get_start_and_end(d.getTime())
  async function get_data() {
    var tasks = await get_tasks({
      filters: {
      _id : user_id
    }})
    set_day_tasks(tasks.filter(task => task.start_date >= start && task.end_date <= end ))
  }
  useEffect(() => {
    get_data()
  },[])
  return (
    <div>
      <div>DayCalendar</div>
      <p>showing from {start} : {new Date(start)}</p>
      <p>to {end} : {new Date(end)}</p>
      <p>---------------</p>
      <p>json stringify of day_tasks : {JSON.stringify(day_tasks)}</p>
    </div>
  );
};
