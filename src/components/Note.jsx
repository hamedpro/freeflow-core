import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { get_notes, get_note_sections } from '../../api/client'
import ObjectBox from './ObjectBox'
export const Note = () => {
    var { note_id, workspace_id, workflow_id, username } = useParams()
    var [note, set_note] = useState(null)
    var [note_sections, set_note_sections] = useState(null)
    async function get_data() {
        var all_notes = await get_notes({ username })
        set_note(all_notes.find(note => note._id == note_id))
        set_note_sections(await get_note_sections({creator : username,note_id}))
    }
    useEffect(() => {
        get_data()
    },[])
  return (
      <div>
          <h1>Note</h1>
          {note !== null && (
             <>
              <h1>note_data : </h1>
          <ObjectBox object={note} />
              </>
          )}
          {note_sections !== null && (
              <>
              <h1>note sections :</h1>
              {note_sections.map((note_section, index) => {
                  return (
                      <React.Fragment key={index}>
                        <ObjectBox object={note_section}  />
                  </React.Fragment>)
              }
                  )}
                  </>
          )}
    </div>
  )
}
