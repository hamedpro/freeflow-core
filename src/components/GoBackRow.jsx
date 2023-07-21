import { Button } from "primereact/button"
import React from "react"

export const GoBackRow = () => {
    return (
        <div className="p-2 flex space-x-2 py-3">
            <div className="p-buttonset">
                <Button
                    className="h-8 px-2"
                    icon={<i className="bi bi-caret-left-fill mr-2" />}
                    onClick={() => nav(`/${meta_id}`)}
                >
                    Back
                </Button>
            </div>
        </div>
    )
}
