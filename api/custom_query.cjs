module.exports = {
	custom_query: (mysql_connection, query) => {
		return new Promise((resolve, reject) => {
			mysql_connection.query(query, (error, result) => {
				resolve({ error, result });
			});
		});
	},
};
