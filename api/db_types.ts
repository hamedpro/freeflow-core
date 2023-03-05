import { ObjectId } from "mongodb";
interface collaborator {
	user_id: ObjectId;
	is_owner: boolean;
}
interface MongodbBaseDocument {
	_id: ObjectId;
}
interface UserDocument extends MongodbBaseDocument {
	username?: string;
	collaborators: collaborator[];
	password?: string;
	email_is_verified?: boolean;
	mobile_is_verified?: boolean;
	mobile: string;
	calendar_type: string;
	week_starting_day: string;
	language: string;
	full_name: string;
}
interface NoteCommmitDocument extends MongodbBaseDocument {
	user_id: ObjectId;
	data: string;
	time: number;
}
interface NoteDocument extends MongodbBaseDocument {
	user_id: string;
	title: string;
	init_date: string;
	pack_id: string;
	collaborators: collaborator[];
}
interface ResourceDocument extends MongodbBaseDocument {
	pack_id: string;
	collaborators: collaborator[];
	description: string;
	title: string;
	file_id: string;
}
interface TaskDocument extends MongodbBaseDocument {
	pack_id: string;
	collaborators: collaborator[];
	linked_notes: string[];
	end_date: string;
	start_date: string;
	title: string;
	category_id: string;
	description: string;
}
interface EventDocument extends MongodbBaseDocument {
	collaborators: collaborator[];
	end_date: string;
	user_id: string;
	start_date: string;
	title: string;
	category_id: string;
}
interface MessageDocument extends MongodbBaseDocument {
	submit_time: string;
	text: string;
	user_id: string;
	unit_context: string;
	unit_id: string;
}
interface CalendarCategoryDocument extends MongodbBaseDocument {
	user_id: string;
	color: string;
	name: string;
}
interface PackDocument extends MongodbBaseDocument {
	title: string;
	description: string;
	collaborators: collaborator[];
	pack_id: string;
}
interface VerificationCodeDocument extends MongodbBaseDocument {
	kind: string;
	value: string;
	user_id: string;
}
