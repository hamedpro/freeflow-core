import React, { useContext, useEffect } from "react"
import { Link } from "react-router-dom"
import { Section } from "./section"
import { UnifiedHandlerClientContext } from "../UnifiedHandlerClientContext"
export const Root = () => {
    var { strings } = useContext(UnifiedHandlerClientContext)

    return (
        <>
            <h1>{strings[1]}</h1>
            <Section title={strings[4]}>
                <Link to="/login">{strings[2]}</Link>
                <br />
                <Link to="/register">{strings[3]}</Link>

                <br />
                <Link to="/dashboard">dashboard</Link>
            </Section>
        </>
    )
}
