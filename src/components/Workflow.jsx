import React, { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get_notes, get_workflow_tasks, new_note } from '../../api/client'
import ObjectBox from "./ObjectBox"
const Workflow = () => {
    var nav = useNavigate()
    var {workflow_id,username ,workspace_id} = useParams()
    var [notes, set_notes] = useState(null)
    var [tasks, set_tasks] = useState(null)
    async function get_data() {
        try {
            var response = await get_notes({ username })
            set_notes(response.filter(note => note.workflow_id === workflow_id))
            set_tasks(await get_workflow_tasks({workflow_id,creator : username}))
        } catch (error) {
            console.log(error)
            alert('something went wrong. details in console')
        }
    }
    useEffect(() => {
        get_data()
    },[])
  return (
      <div>
          <h1>Workflow page</h1>
          {notes !== null && (
              <>
                  <h1>notes : </h1>
                  {notes.map((note, index) => {
                     
                      return (
                          <React.Fragment key={index}>
                              <ObjectBox object={note}
                                  link={`/users/${username}/workspaces/${workspace_id}/workflows/${workflow_id}/notes/${note._id}`} />
                          </React.Fragment>
                      )
                  })}
              </>
              
              
          )
          }
          {tasks !== null && (
              <>
                  <h1>tasks : </h1>
                  {tasks.map((task, index) => {
                     
                      return (
                          <React.Fragment key={index}>
                              <ObjectBox
                                  object={task}
                                  link={`/users/${username}/workspaces/${workspace_id}/workflows/${workflow_id}/tasks/${task._id}`} />
                          </React.Fragment>
                      )
                  })}
              </>
              
              
          )
          }
          
      </div>
     
  )
}

export default Workflow