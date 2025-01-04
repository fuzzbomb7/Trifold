export const startupModules = {
	BEER: 0,
	// TODO: Add other module enum values 
}

// No trailing '/'!
export const API_ROOT = "https://trifoldweb.azurewebsites.net";

// Testing URL
//export const API_ROOT = "https://localhost:44329";

// Check connectivity
const axios = require("axios").default;

export async function isConnected() {
	let connect = false;
	await axios.get('/img/1px.png', { timeout: 3000 })
		.then(function () {
			connect = true;
		})
		.catch(function () {
			connect = false;
		});
	return connect;
}

