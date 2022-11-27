import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { new_note } from '../../api/client'

export const NewNote = () => {
    var nav = useNavigate()
    var { user_id , workspace_id, workflow_id } = useParams()
    async function submit_new_note() {
        try {
            var id_of_new_note = await new_note({
                creator_user_id: user_id,
                workflow_id,
                title: document.getElementById('title').value,
                workspace_id
            })
            alert("all done. navigating to newly created note's page")
            nav(`/users/${user_id}/workspaces/${workspace_id}/workflows/${workflow_id}/notes/${id_of_new_note}`)
        } catch (error) {
            console.log(error)
            alert('something went wrong. details in console')
        }
    }
  return (
      <div>
          <h1>NewNote</h1>
          <h1>user_id of the creator : {user_id}</h1>
          <h1>workspace_id : {workspace_id}</h1>
          <h1>workflow_id : {workflow_id}</h1>
          <h1>enter a title : </h1>
          <input id="title" className='border border-blue-400' /> 
          <button onClick={submit_new_note}>submit this note</button>
    </div>
  )
}
