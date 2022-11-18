import React from 'react'
import { useParams } from 'react-router-dom'

export const Note = () => {
    var {note_id,workspace_id,workflow_id,username } = useParams()
  return (
    <div>Note</div>
  )
}
