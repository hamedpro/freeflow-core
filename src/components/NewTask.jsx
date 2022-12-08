import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { TextField } from "@mui/material";
import AdapterJalaali from "@date-io/jalaali";
import { DateTimePicker } from "@mui/x-date-pickers";
import { new_task } from "../../api/client";
import Select from "react-select";
import notesData from "../../notesData";
//TODO: component re-renders
export const NewTask = () => {
  var nav = useNavigate();
  const [notes, setNotes] = useState([]);
  //TODO: integrate the states into one object
  const [selectedNotes, setSelectedNotes] = useState(null);
  const [selectedParentTask, setSelectedParentTask] = useState(null);
  //TODO: check _locale for possible option to output the _d(date) object in jalaali's format
  const [dateAndTimePickerStartValue, setDateAndTimePickerStartValue] =
    useState(null);
  const [dateAndTimePickerEndValue, setDateAndTimePickerEndValue] =
    useState(null);
  const [dateAndTimePickerDeadlineValue, setDateAndTimePickerDeadlineValue] =
    useState(null);
  var { user_id, workspace_id, workflow_id } = useParams();
  useEffect(() => {
    setNotes(notesData);
  }, []);

  async function submit_new_task() {
    // var val = (id) => document.getElementById(id).value;
    const linkedNotes = notes.filter(
      (linkedNote) => linkedNote.title === selectedNotes
    );
    try {
      var id_of_new_task = await new_task({
        creator_user_id: user_id,
        workflow_id,
        end_date: dateAndTimePickerEndValue._d.getTime(),
        start_date: dateAndTimePickerStartValue._d.getTime(),
        deadline_date: dateAndTimePickerDeadlineValue._d.getTime(),
        linked_notes: linkedNotes,
        workspace_id,
        //TODO: parentTask
        parent: val("parent_task") === "" ? null : val("parent_task"),
      });
      alert("all done. navigating to the newly created task's page");
      nav(
        `/users/${user_id}/workspaces/${workspace_id}/workflows/${workflow_id}/tasks/${id_of_new_task}`
      );
    } catch (error) {
      console.log(error);
      alert("something went wrong. details in console");
    }
  }
  return (
    <div className='p-2'>
      <h1>NewTask</h1>
      <h1>creator's user_id : {user_id} </h1>
      <h1>workspace_id : {workspace_id} </h1>
      <h1>workflow_id : {workflow_id} </h1>
      <form onSubmit={submit_new_task}>
        <Select
          defaultValue={selectedNotes}
          onChange={setSelectedNotes}
          options={notes && notes.map((note) => note.title)}
          isMulti
          isSearchable
          value={selectedNotes}
        />
        <Select
          defaultValue={selectedParentTask}
          onChange={setSelectedParentTask}
          options={
            /*notes && notes..... TODO: Parent Task???*/ [
              { value: 1, label: 1 },
              { value: 2, label: 2 },
            ]
          }
          isSearchable
          value={selectedParentTask}
        />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            label='DateTimePicker'
            value={dateAndTimePickerStartValue}
            onChange={(newValue) => {
              setDateAndTimePickerStartValue(newValue);
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            label='DateTimePicker'
            value={dateAndTimePickerEndValue}
            onChange={(newValue) => {
              setDateAndTimePickerEndValue(newValue);
            }}
          />
        </LocalizationProvider>
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <DateTimePicker
            renderInput={(props) => <TextField {...props} />}
            label='DateTimePicker'
            value={dateAndTimePickerDeadlineValue}
            onChange={(newValue) => {
              setDateAndTimePickerDeadlineValue(newValue);
            }}
          />
        </LocalizationProvider>
      </form>
    </div>
  );
};
