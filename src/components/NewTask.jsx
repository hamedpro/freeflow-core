import React from 'react'
import { useParams } from 'react-router-dom'
import { new_task } from '../../api/client'

export const NewTask = () => {
  var { username, workspace_id, workflow_id } = useParams()
  async function submit_new_task() {
    var tmp = (id) =>document.getElementById(id).value
    try {
      await new_task({
        creator: username,
        workflow_id,
        end_date: Number(tmp('end_date')),
        start_date: Number(tmp('start_date')),
        deadline_date: Number(tmp('deadline_date')),
        linked_notes: tmp('linked_notes').split(','),
        workspace_id,
        parent : tmp('parent_task') === "" ? null : tmp('parent_task')
      })
      alert('all done')
    } catch (error) {
      console.log(error);
      alert('something went wrong. details in console')
    }
  }
  return (
    <div className='p-2'>
      <h1>NewTask</h1>
      <h1>creator's username : {username} </h1>
      <h1>workspace_id : {workspace_id} </h1>
      <h1>workflow_id : {workflow_id} </h1>
      <h1>enter linked_notes seperated by comma : </h1>
      <input className="border border-blue-400"  id="linked_notes" />
      <h1>enter id of it's parent task : (fill empty if its the starting task in the pyramid )</h1>
      <input className="border border-blue-400"  id="parent_task" /> 
      <h1>start_date : </h1>
      <input className="border border-blue-400"  id="start_date" />
      
      <h1>end_date : </h1>
      <input className="border border-blue-400"  id="end_date" />

      <h1>deadline_date : </h1>
      <input className="border border-blue-400"  id="deadline_date" />

      <button onClick={submit_new_task} className="block">submit new task </button>

    </div>
  )
}
