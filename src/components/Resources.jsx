import React, { Fragment, useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { download_resource, get_resources } from '../../api/client'
import ObjectBox from './ObjectBox'
export const Resources = () => {
  var {user_id,workspace_id,workflow_id } = useParams()
  var [resources, set_resources] = useState(null)
  async function get_data() {
    var filters =  {
      user_id : user_id,
      workspace_id
    }
    if (workflow_id) {
      filters['workflow_id'] = workflow_id
    }
    var tmp = await get_resources({
      filters
    })
    set_resources(tmp)
  }
  useEffect(() => {
    get_data()
  },[])
  return (
    <div>
      <h1>Resources</h1>
      {resources !== null && resources.map((resource,index) => {
        return (
          <Fragment key={index}>
            <ObjectBox object={resource} onClick={() => {
              download_resource({
                resource_id : resource._id
              })
            }} /> 
            
          </Fragment>
        )
      })}
    </div>
  )
}
