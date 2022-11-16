import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { get_user } from "../api/client";

const UserProfile = () => {
    var [user, set_user] = useState(null);
    var {username} = useParams()
    async function fetch_user() {
        try {
            var response = await get_user({ username })
            set_user(response)
        } catch (error) {
            
        }
    }
    useEffect(()=>{fetch_user()},[])
	return (
		<div>
			<h1>UserProfile</h1>
			user data fetched by api : {JSON.stringify(user)}
		</div>
	);
};

export default UserProfile;
