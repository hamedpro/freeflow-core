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
export var get_users = async () => await custom_axios({
    route : "/users"
})
export var new_note = async ({
    creator, // username 
    init_date, //should be in format of new Date.getTime()
}) => await custom_axios({
    route: "/notes",
    method: "post",
    body: {
        creator,
        init_date
    }
})
export var get_notes = async () => await custom_axios({
    route : "/notes"
})
export var new_workspace = async ({ 
    creator,
    init_date
}) => await custom_axios({
    route: '/workspaces',
    method: "post",
    body: {
        creator,
        init_date
    }
})
export var get_workspaces = async () => await custom_axios({
    route : "/workspaces"
})
export var new_note_section_image = async ({ 
    creator,
    init_date,
    href,
    index, // index of this section in array of that note's sections
    last_modification,
    note_id 

}) => await custom_axios({
    //this func asks server to add a note section with type "image"
    route: "/note_sections",
    method: "post",
    body: {
        creator,
        init_date,
        href,
        index
        , last_modification,
        note_id
    }
})
export var new_note_section_text = async ({ 
    creator,
    init_date,
    text,
    index, // index of this section in array of that note's sections
    last_modification,
    note_id 

}) => await custom_axios({
    //this func asks server to add a note section with type "image"
    route: "/note_sections",
    method: "post",
    body: {
        creator,
        init_date,
        text,
        index
        , last_modification,
        note_id
    }
})
export var get_note_sections = async () => await custom_axios({
    route : '/note_sections'
})

