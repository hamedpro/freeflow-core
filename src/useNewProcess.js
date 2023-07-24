import { useContext } from "react"
import { processes_context } from "./processes_context"
import { genRanHex } from "../api_dist/api/utils"
class Process {
    // this.status : failed | progress | done
    // this.start_time? : number
    // this.end_time? : number

    constructor(description) {
        this.start_time = new Date().getTime()
        this.status = "progress"
        this.description = description
    }
    end() {
        this.end_time = new Date().getTime()
        this.status = "done"
    }
    fail() {
        this.end_time = new Date().getTime()
        this.status = "failed"
    }
}
export function useNewProcess() {
    var tmp = useContext(processes_context)
    var { set_processes } = tmp
    return async (description, func) => {
        var new_process = {
            description,
            id: `${new Date().getTime()}-${genRanHex(20)}`,
            status: "progress", // or done or failed,
            start_time: new Date().getTime(),
        }
        set_processes((prev) => [...prev, new_process])
        try {
            await func()
            set_processes((prev) =>
                prev.map((pc) =>
                    pc.id === new_process.id
                        ? {
                              ...pc,
                              status: "done",
                              end_time: new Date().getTime(),
                          }
                        : pc
                )
            )
        } catch (error) {
            set_processes((prev) =>
                prev.map((pc) =>
                    pc.id === new_process.id
                        ? {
                              ...pc,
                              status: "failed",
                              end_time: new Date().getTime(),
                          }
                        : pc
                )
            )
            throw error
        }
    }
}
