import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get_workflow_tasks } from '../../api/client'
import ObjectBox from './ObjectBox'
export const Task = () => {
  var { task_id, workspace_id, workflow_id, username } = useParams()
  var [task, set_task] = useState(null)
  async function get_data() {
    var workflow_tasks = await get_workflow_tasks({
      workflow_id,
      creator: username
    })
    set_task(workflow_tasks.find(task => task._id == task_id))
  }
  useEffect(() => {
    get_data()
  },[])
  return (
    <div>
      <h1>Task</h1>
      {task !== null && (
        <ObjectBox object={task} /> 
      )}
    </div>
  )
}
