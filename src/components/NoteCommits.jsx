import React, { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Section } from "./section";
import { StyledDiv } from "./styled_elements";

export const NoteCommits = () => {
	var nav = useNavigate();
	var { note_id } = useParams();
	var { global_data, get_global_data } = useContext(GlobalDataContext);
	var note_commits = global_data.all.note_commits // sorted by note_commit.time (descending)
		.filter((i) => i.note_id === note_id)
		.sort((i1, i2) => i1.time - i2.time)
		.reverse();
	return (
		<Section title={`note commits of a note with id ${note_id}`}>
			<div className="flex flex-col space-y-2">
				{note_commits.map((note_commit, index) => {
					return (
						<StyledDiv
							key={index}
							onClick={() =>
								nav(`/dashboard/notes/${note_id}?note_commit_id=${note_commit._id}`)
							}
						>
							note commit {note_commit._id}
						</StyledDiv>
					);
				})}
			</div>
		</Section>
	);
};
