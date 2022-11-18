import React from 'react'
import { useParams } from 'react-router-dom'

export const Task = () => {
  var {task_id,workspace_id,workflow_id,username } = useParams()
  return (
    <div>Task</div>
  )
}
