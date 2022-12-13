import { useState, useEffect, Fragment } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TextField } from "@mui/material";
//import AdapterMoment from "@date-io/jalaali";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { get_tasks, get_user_notes, new_task } from "../../api/client";
import Select from "react-select";
//TODO: component re-renders
export const NewTask = () => {
	var nav = useNavigate();
	var { user_id, workspace_id, workflow_id } = useParams();
	const [notes, setNotes] = useState([]);
	const [workflow_tasks, set_workflow_task] = useState();
	const [selectedNotes, selectNotes] = useState(null);
	const [selectedParentTask, selectParentTask] = useState(null);
	//TODO: check _locale for possible option to output the _d(date) object in jalaali's format
	const [selected_dates, set_selected_dates] = useState({
		end: null,
		deadline: null,
		start: null,
	});

	async function get_data() {
		var tmp = await get_tasks({ filters: { workflow_id } });
		set_workflow_task(tmp);
		setNotes(await get_user_notes({ creator_user_id: user_id }));
	}
	useEffect(() => {
		get_data();
	}, []);
	async function submit_new_task() {
    try {
      var tmp = {
				creator_user_id: user_id,
				workflow_id,
				end_date: selected_dates.end,
				start_date: selected_dates.start,
				deadline_date: selected_dates.deadline,
				linked_notes: selectedNotes.map(i=>i.value),
				workspace_id,
				parent: selectedParentTask.value ,
      }
			var id_of_new_task = await new_task(tmp);
			alert("all done. navigating to the newly created task's page");
			nav(
				`/users/${user_id}/workspaces/${workspace_id}/workflows/${workflow_id}/tasks/${id_of_new_task}`
			);
		} catch (error) {
			console.log(error);
			alert("something went wrong. details in console");
		}
	}
	if (!workflow_tasks || !notes) return <h1>still loading data ...</h1>;
	return (
		<div className="p-2">
			<h1>NewTask</h1>
			<h1>creator's user_id : {user_id} </h1>
			<h1>workspace_id : {workspace_id} </h1>
			<h1>workflow_id : {workflow_id} </h1>
			<h2>select notes you want to link with this task :</h2>
			<Select
				onChange={selectNotes}
				options={notes.map((note) => {
					return {
						value: note._id,
						label: note.title,
					};
				})}
				isMulti
				isSearchable
				value={selectedNotes}
			/>
			<br />
			<h2>
				select which one of this workflow's tasks you want to set as this task's parent in
				tasks hierarchy:
			</h2>
			<Select
				onChange={selectParentTask}
				options={[
					{ value: null, label: "this task has not any parent" },
					...workflow_tasks.map((task) => {
						return {
							value: task._id,
							label: task.title,
						};
					}),
				]}
				isSearchable
				value={selectedParentTask}
			/>
			<br />
			<h2>select 'start', 'end' and deadline dates for this task : </h2>
			{["start", "deadline", "end"].map((type, index) => {
				return (
					<div key={index} className="mb-3 block">
						<LocalizationProvider dateAdapter={AdapterDayjs}>
							<DateTimePicker
								renderInput={(props) => <TextField {...props} />}
								label={`select task ${type} date`}
								value={selected_dates[type]}
								onChange={(newValue) => {
									set_selected_dates((prev_dates) => {
										var tmp = { ...prev_dates };
										tmp[type] = newValue.$d.getTime();
										return tmp;
									});
								}}
							/>
						</LocalizationProvider>
					</div>
				);
			})}
			<button onClick={submit_new_task}>submit</button>
		</div>
	);
};
