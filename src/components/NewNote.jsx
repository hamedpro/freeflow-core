import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { new_note } from '../../api/client'

export const NewNote = () => {
    var { username, workspace_id, workflow_id } = useParams()
    async function submit_new_note() {
        try {
            await new_note({
                creator: username,
                init_date: new Date().getTime(),
                last_modification: new Date().getTime(),
                workflow_id,
                title: document.getElementById('title').value,
                workspace_id
            })
            alert('all done')
        } catch (error) {
            console.log(error)
            alert('something went wrong. details in console')
        }
    }
  return (
      <div>
          <h1>NewNote</h1>
          <h1>creator : {username}</h1>
          <h1>workspace_id : {workspace_id}</h1>
          <h1>workflow_id : {workflow_id}</h1>

          <h1>enter a title : </h1>
          <input id="title" className='border border-blue-400' /> 
          <button onClick={submit_new_note}>submit this note</button>
    </div>
  )
}
