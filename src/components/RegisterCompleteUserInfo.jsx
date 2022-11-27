import React from 'react'
import { useParams } from 'react-router-dom'

export const RegisterCompleteUserInfo = () => {
  var {user_id} = useParams()
  console.log('here is register complete',user_id)
  return (
    <div>RegisterCompleteUserInfo</div>
  )
}
