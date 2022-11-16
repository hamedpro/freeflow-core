import React, { useState } from "react";
import { useEffect } from "react";
import { custom_range } from "../common";
import "./MonthCalendarStyles.css"
const InstantOverviewPanel = ({hovered_days,clicked_day,tasks,selected_year,selected_month_index }) => {
    function gen_day_filter_duration(year,month_index,day) {
        var start = new Date(year, month_index, day).getTime()
        return {start,end : start + 3600*24*1000}
    }
    function gen_filter_duration(days_array) {
        //important notes : 
        return {
            start: gen_day_filter_duration(selected_year,selected_month_index,days_array[0])['start'],
            end : gen_day_filter_duration(selected_year,selected_month_index,days_array[days_array.length -1])['end']
        }
    }
    function filterd_tasks(tasks, start, end) {
        return tasks.filter(task =>
            task.planned_start_date > start &&
            task.planned_end_date < end
        )
    }
    return (
        <>
            {clicked_day !== null && (
                <>
                    <h1>a day is clicked : </h1>
                    <br />
                    <p>{JSON.stringify(
                        filterd_tasks(
                            tasks,
                            gen_filter_duration([clicked_day])['start'],
                            gen_filter_duration([clicked_day])['end']
                        ))}
                    </p>
                </>
            )}
            {clicked_day === null && hovered_days.length !== 0 && (
                <>
                <h1>a days row is hovered : </h1>
                <br />
                <p>{JSON.stringify(
                    filterd_tasks(
                        tasks,
                        gen_filter_duration(hovered_days)['start'],
                        gen_filter_duration(hovered_days)['end']

                    ))}
                </p>
            </>
            )}
            {clicked_day === null && hovered_days.length === 0 && (
                <h1>there is not any row hovered or any day clicked</h1>
            )}
        </>
    )
}
const MonthCalendar = ({ tasks }) => {
    var [hovered_days,set_hovered_days] = useState([])
    var [clicked_day,set_clicked_day] = useState(null)
    var dev_mode = false;
	/* 
        this component gives an overview of what tasks are there in each month and 
        when you click on each week there will be a side bar showing an overview of that week and also
        when you click on each day you will get an overview of what is happening there in that specific day
    */
	var month_names = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
    ].map((i) => i.toLowerCase());
    var day_names = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(i=>i.toLowerCase())
	var [selected_month, select_month] = useState(month_names[new Date().getMonth()]);
	var [selected_year, select_year] = useState(new Date().getFullYear());
	function get_month_number(month_name) {
		return month_names.indexOf(month_name) + 1;
    }
    function get_months_days_count(year) {
        return [
            31,
            year % 4 === 0 ? 29 : 28,
            31,
            30,
            31,
            30,
            31,
            31,
            30,
            31,
            30,
            31,
        ];
    }
    
	function gen_start_and_end(year, month_name) {
		var months_days_count = get_months_days_count(year)
		var start = new Date(year, get_month_number(month_name) - 1, 1).getTime();
		var end = start + months_days_count[get_month_number(month_name) - 1] * 24 * 3600 * 1000;
		return { end, start };
	}
	var filter_times = gen_start_and_end(selected_year, selected_month);
	var filtered_tasks =
		tasks !== null
			? tasks.filter(
					(task) =>
						task.planned_start_date > filter_times.start &&
						task.planned_end_date < filter_times.end
			  )
            : null;
    function calc_calnedar_parts() {
        /* 
            this function will calc how many rows with 
            7 columns are required to show all days 
            of the selected month and the exact position 
            of each day in each row 
        */
        /* it's default is to start the week from sunday  */
        var selected_month_number = get_month_number(selected_month)
        var index_of_first_day_of_the_selected_month = new Date(selected_year, selected_month_number -1 , 1).getDay()
        var result = [[]]
        var tmp = custom_range({ from: 1, to: get_months_days_count(selected_year)[get_month_number(selected_month) - 1] })
        var starting_null_items_count = index_of_first_day_of_the_selected_month
        for (let i = 0; i < starting_null_items_count; i++){
            result[result.length - 1].push(null)
        }
        while (tmp.length !== 0) {
            if (result[result.length -1].length !== 7) {
                result[result.length - 1].push(tmp[0])
                tmp.shift()
            } else {
                result.push([])
                result[result.length -1].push(tmp[0])
                tmp.shift()
            }
        }
        while (result[result.length - 1].length !== 7) {
            result[result.length -1].push(null)
        }
        return result 
    }
	//take care if becuse of setState being async we can not use its value right there in component function body (may selected_month be undefined there)
	
    return (
		<React.Fragment>
            <h1>MonthCalendar</h1>
            <select onChange={e => { 
                select_month(e.target.value)
            }}>
                {month_names.map((month_name,index)=>{
                    return (
                        <option key={ index} value={month_name}>{month_name}</option>
                    )
                })}
            </select>
			<div className={["border border-red-400",dev_mode ? "" :"hidden"].join(' ')}>
				selected month = {selected_month}
				<br />
				filter times : {JSON.stringify(filter_times)}
				<br />
                tasks of the selected month : {JSON.stringify(filtered_tasks)}
                <br />
                name of first day of the selected month ({selected_month}) : {day_names[calc_calnedar_parts()]}
                <br />
                result of calc_calnedar_parts function : {JSON.stringify(calc_calnedar_parts())}
            </div>
            
                <table className="month_calendar">
                    <tbody>
                        <tr className="headers">
                            <th>sunday</th>
                            <th>monday</th>
                            <th>tuesday</th>
                            <th>wednesday</th>
                            <th>thursday</th>
                            <th>friday</th>
                            <th>saturday</th>
                        </tr>
                        {calc_calnedar_parts().map((calendar_part,index) => {
                            return (
                                <tr key={index}
                                    onMouseEnter={e => {
                                        set_hovered_days(calendar_part.filter(j=>j !== null))
                                    }}
                                    onMouseLeave={e => {
                                        set_hovered_days([])
                                    }}
                                >
                                    {calendar_part.map((day,index2) => {
                                        return (
                                            <td
                                                key={index2}
                                                onClick={() => {
                                                    set_clicked_day(day == clicked_day ? null : day)
                                                }}
                                                className={day == clicked_day && day!== null ? "bg-blue-900 text-white" : ""}
                                            >{day !== null ? day : "null"}</td>
                                        )
                                    })}
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            <InstantOverviewPanel
                clicked_day={clicked_day}
                hovered_days={hovered_days}
                tasks={tasks}
                selected_year={selected_year}
                selected_month_index={get_month_number(selected_month) -1}
            />
		</React.Fragment>
	);
};

export default MonthCalendar;
