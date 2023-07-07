import { useContext } from "react"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"

export function SubscribtionPage() {
    var { strings } = useContext(UnifiedHandlerClientContext)
    return <h1>{strings[45]}</h1>
}
