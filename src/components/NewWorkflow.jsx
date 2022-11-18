import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { get_notes, get_workflow_tasks, new_workflow } from '../../api/client'

const NewWorkflow = () => {
    var { workspace_id, username } = useParams()
    async function submit_new_workflow() {
        try {
            await new_workflow({
                workspace_id,
                creator : username,
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                collaborators : document.getElementById('collaborators').value.split(',')
            })
            alert('all done!')
        } catch (error) {
            console.log(error)
            alert('something went wrong. details in console')
        }
    }
  return (
      <div className='p-2'>
          <h2>NewWorkflow</h2>
          <h1>creator : {username}</h1>
          <h1>workspace_id : {workspace_id}</h1>
          <h1>enter title : </h1> <input id="title" />
          <h1>enter description :</h1> <input id="description" />
          <h1>enter usernames of collaborators seperated by comma</h1> <input id="collaborators" />
            <button onClick={submit_new_workflow}> submit new workflow</button>
      </div>
      
  )
}

export default NewWorkflow