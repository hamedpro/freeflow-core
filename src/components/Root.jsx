import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { eraseCookie, getCookie } from '../common'
export const Root = () => {
  var custom_nav = useNavigate()
  function open_my_profile() {
    var identity = getCookie("identity")
    if (identity === null) {
      alert('you are not logged in yet')
      return 
    } else {
      identity = JSON.parse(identity)
      var user_id = identity.user_id 
      custom_nav(`/users/${user_id}`)
    }
  }
  return (
    <div className='p-2'>
      <h1>Pink Rose</h1>
      <p>-------- SOME ROUTES ------------</p>
      <div className='flex flex-col space-y-2'>
        <Link to={`/login`}>login to account</Link>
        <Link to={`/register`}>register a new user</Link>
        <Link to={`/admin/users`}>users section of admin dashboard</Link>
        <Link to={`/terms`}>our terms of use</Link>
        <Link to={`/subscribtion`}>subscribtion status</Link>
        <button onClick={open_my_profile}>open my user profile </button>
        <button onClick={()=>eraseCookie('identity')}>logout</button>
      </div>
    </div>
  )
}
