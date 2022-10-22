import { useState } from "react";
import { Info } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {trim_text_if_its_long} from "../common"
export function Notifications() {
    var [notifications, set_notifications] = useState([]);
    window.remove_notification = (notification_id) => {
        set_notifications(previous_state => previous_state.filter(notif => notif.id !== notification_id))
    }
    var navigate = useNavigate()
    window.notify = ({
        type = "info",
        title,
        text,
        onClick = undefined
    }) => {
        var id_of_this_notif = Math.random()
        set_notifications(previos_state => [...previos_state, {
            id: id_of_this_notif ,
            type,
            text,
            title,
            onClick
        }])
        setTimeout(() => {
            window.remove_notification(id_of_this_notif)
        },6000)
    }
    /* useEffect(()=>console.log(notifications),[notifications]) */
    return (
        <div
            className={["z-50 fixed w-1/2 h-1/2 overflow-y-auto bottom-14 left-2 flex flex-col items-end", notifications.length === 0 ? "hidden" : ""].join(" ")}
            id="notifications_container">
            {/* todo when this container is not hidden hover effects and onClicks of elements that are behind it dont work  */}

            {notifications.map(notif => {
                return (
                    <div
                        className={`break-all duration-300  cursor-pointer p-2 ${notif.type === "info" && "bg-blue-700 hover:bg-blue-800"} ${notif.type === "error" && "bg-red-700 hover:bg-red-800"} text-white`}
                        key={notif.id}
                        onClick={notif.onClick !== undefined ? notif.onClick : () => { navigate("/logs"); window.remove_notification(notif.id)} }
                    >
                        <Info sx={{ color: "white" }} /> {notif.title} : {trim_text_if_its_long(notif.text,100)} {notif.onClick !== undefined ?   "(click for more details)" : "(click to see logs)"}
                    </div>
                )
            })}
        </div>
    )
}