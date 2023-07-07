import React, { useContext } from "react";
import { UnifiedHandlerClientContext } from "./UnifiedHandlerClientContext";
import ObjectBox from "./components/ObjectBox";
export const TimeMachine = () => {
	var { transactions, time_travel_snapshot, strings } = useContext(
        UnifiedHandlerClientContext
    )

    return (
        <div>
            <h1>{strings[49]}</h1>
            {time_travel_snapshot !== undefined && (
                <div>
                    <i className="bi-clock-history" />
                    <b>
                        {strings[153]} {time_travel_snapshot}
                    </b>
                    <button onClick={() => uhc.time_travel(undefined)}>
                        {strings[154]}
                    </button>
                </div>
            )}
            <table style={{ width: "100%" }}>
                <thead>
                    <tr>
                        <th>{strings[155]}</th>
                        <th>{strings[156]}</th>
                        <th>{strings[157]}</th>
                        <th>{strings[158]}</th>
                        <th>{strings[159]}</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions
                        .sort((i1, i2) => i1.id - i2.id)
                        .map((tr) => (
                            <tr key={tr.id}>
                                <td>{tr.id}</td>
                                <td className="break-all">
                                    <ObjectBox object={tr.diff} />{" "}
                                </td>
                                <td>{tr.time}</td>
                                <td>{tr.user_id}</td>
                                <td>
                                    <button
                                        onClick={() => uhc.time_travel(tr.id)}
                                    >
                                        {tr.id === time_travel_snapshot ? (
                                            <i className="bi-toggle-on" />
                                        ) : (
                                            <i className="bi-toggle-off" />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    )
};
