import { Info } from "@mui/icons-material";
import { useState } from "react";
import { Alert } from "./alert/comp";
import Section from "./section/comp";

export function Logs() {
	var [logs, set_logs] = useState([]);
	window.new_log = ({ type, text, title }) => {
		set_logs((previous_state) => [
			...previous_state,
			{
				type,
				text,
				title,
				id: Math.random(),
			},
		]);
	};
	return (
		<Section title="logs" className="mx-1 mt-2" innerClassName="px-2">
			{logs.length !== 0 ? (
				<>
					{logs.map((log) => {
						return (
							<>
								<h1 key={log.id}>
									{log.type} : #{log.id} : {log.title} : {log.text}
								</h1>
							</>
						);
					})}
				</>
			) : (
                    <Alert icon={<Info />}>
                        there is not any log submitted
                </Alert>
			)}
		</Section>
	);
}
