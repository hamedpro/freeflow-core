import React, { useState } from "react";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { get_user } from "../api/client";
import ObjectBox from "./components/ObjectBox";

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
		<div className="p-2">
			<h1>UserProfile</h1>
            user data fetched by api :
            <br />
            <ObjectBox object={user} />
		</div>
	);
};

export default UserProfile;
