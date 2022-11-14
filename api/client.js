import axios from "axios"
export async function custom_axios({
    api_endpoint = window.api_endpoint,
    route,
    method = "GET" ,// case insensitive,
    body = {}
}) {
    return await axios({
        url: new URL(route, api_endpoint).href,
        method: method.toUpperCase(),
        data : body 
    })
}
export var new_user = async ({
    username,
    password,
    subscribtion_plan = null 
}) => await custom_axios({
    route: "/users",
    method: "POST",
    body: {
        username,
        password,
        subscribtion_plan
    }
})
export var get_user = async ({username}) => await custom_axios({
    route: `/users/${username}`
})
export var delete_user = async ({ username }) => await custom_axios({
    route: `/users/${username}`,
    method : "delete"
})
export var new_note = async ({
    creator, // username 
    init_date,
    last_modification //should be in format of new Date.getTime()
}) => await custom_axios({
    route: `/users/${creator}/notes`,
    method: "post",
    body: {
        init_date,
        last_modification
    }
})
export var get_notes = async ({
    username
}) => await custom_axios({
    route : `/users/${username}/notes`
})
export var delete_note = async ({
    username,
    note_id 
}) => await custom_axios({
    route: `/users/${username}/notes/${note_id}`,
    method : "delete"
})
export var update_note = async ({
    username,
    note_id,
    last_modification
}) => await custom_axios({
    route: `/users/${username}/notes/${note_id}`,
    method: 'patch',
    body: {
        last_modification
    }
})
export var new_workspace = async ({ 
    creator,
    init_date,
    title,
    description
}) => await custom_axios({
    route: `/users/${username}/workspaces`,
    method: "post",
    body: {
        init_date,
        title,
        description
    }
})
export var get_workspaces = async ({
    username
}) => await custom_axios({
    route : `/users/${username}/workspaces`
})
export var update_workspace = async ({
    username,
    workspace_id
}) => await custom_axios({
    route: `/users/${username}/workspaces/${workspace_id}`,
    method : "patch"
})
export var delete_workspace = async ({
    username,
    workspace_id
}) => await custom_axios({
    route: `/users/${username}/workspaces/${workspace_id}`,
    method : "delete"
})
export var new_note_section_image = async ({
    init_date,
    href,
    index, // index of this section in array of that note's sections
    last_modification,
    init_date,
    note_id

}) => await custom_axios({
    //this func asks server to add a note section with type "image"
    route: `/users/${creator}/notes/${note_id}/note_sections`,
    method: "post",
    body: {
        init_date,
        href,
        index,
        last_modification,
        type :"image"
    }
})
export var new_note_section_text = async ({
    init_date,
    text,
    index, // index of this section in array of that note's sections
    last_modification,
    init_date,
    note_id

}) => await custom_axios({
    //this func asks server to add a note section with type "text"
    route: `/users/${creator}/notes/${note_id}/note_sections`,
    method: "post",
    body: {
        init_date,
        text,
        index,
        last_modification,
        type : 'text'
    }
})
export var get_note_sections = async ({
    note_id,
    creator
}) => await custom_axios({
    route : `/users/${creator}/notes/${note_id}/note_sections`
})

