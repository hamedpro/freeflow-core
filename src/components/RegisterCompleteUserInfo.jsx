import React from 'react'
import { useSearchParams } from 'react-router-dom'

export const RegisterCompleteUserInfo = () => {
  var [search_params, set_search_params] = useSearchParams()
  var user_id = search_params.get('user_id')
  console.log('here is register complete',user_id)
  return (
    <div>RegisterCompleteUserInfo</div>
  )
}
