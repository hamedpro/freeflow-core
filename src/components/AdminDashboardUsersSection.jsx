import React, { useState } from 'react'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { get_users as api_get_users } from '../../api/client'
import ObjectBox from './ObjectBox'

export const AdminDashboardUsersSection = () => {
    var [users, set_users] = useState(null)
    var get_users = async () => set_users(await api_get_users({}))
    useEffect(() => {
        get_users()
    },[])
    return (
        <div>
            <h1>AdminDashboardUsersSection</h1>
            <p>json stringified of users : {JSON.stringify(users)}</p>
            {users !== null ? (
                <>
                    {users.map((user, index) => {
                        return (
                            <React.Fragment key={index}>
                                <ObjectBox object={user} link={`/users/${user._id}`} />
                            </React.Fragment>
                        )
                    })}
                </>
            ) :(<>loading users</>)}
    </div>
  )
}
