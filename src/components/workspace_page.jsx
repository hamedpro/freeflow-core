import React, { useState } from 'react'
import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { get_workspace_workflows } from '../../api/client'
import ObjectBox from "./ObjectBox.jsx"
export const WorkspacePage = () => {
  var nav = useNavigate()
  var { workspace_id, username } = useParams()
  var [workflows, set_workflows] = useState(null)
  async function get_data() {
    try {
      set_workflows(await get_workspace_workflows({ username, workspace_id }))
    } catch (error) {
      console.log(error);
      alert('something went wrong. details in console')
    }
  }
  useEffect(() => {
    get_data()
  },[])
  return (
    <div>
      <h2>WorkspacePage</h2>
      {workflows !== null && (
        <>
        <div>workflows : </div>
          {workflows.map((workflow, index) => {
            return (
              <React.Fragment key={index}>
                <ObjectBox object={workflow} link={`/users/${username}/workspaces/${workspace_id}/workflows/${workflow._id}`} />
          </React.Fragment>
        )
      })}
        </>
      )}
      
    </div>
  )
}
