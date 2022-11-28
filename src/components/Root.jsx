import React from 'react'
import { Link } from 'react-router-dom'
export const Root = () => {
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
      </div>
    </div>
  )
}
