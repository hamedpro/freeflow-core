import React, { useEffect, useState } from "react";
import { Calendar } from "primereact/calendar";
import { useNavigate } from "react-router-dom";

export const MonthCalendar = () => {
	var [date, setDate] = useState();
	var nav = useNavigate();
	useEffect(() => {
		if (date === undefined) return;
		var t = new Date(date);
		var link = `/dashboard/calendar/day?default=${t.getFullYear()}-${t.getMonth()}-${t.getDate()}`;
		nav(link);
	}, [date]);
	return (
		<Calendar value={date} onChange={(e) => setDate(e.value)} inline showWeek className="m-3" />
	);
};
