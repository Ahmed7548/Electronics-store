import nodemailer from "nodemailer";
import { OAuth2Client } from "google-auth-library";
import http from "http";
import url from "url";
// import {} from "node";
import destroyer from "server-destroy";
import open from "open"

const createTransporter = async () => {
	const client = await getAuthenticatedClient();

	console.log(
		client.credentials.refresh_token,
		client.credentials.access_token,
		"<=======tokens"
	);

	return nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: {
			type: "OAUTH2",
			user: process.env.GMAIL,
			clientId: process.env.MAIL_ENGINE_CLIENT_ID,
			clientSecret: process.env.MAIL_ENGINE_CLIENT_SECRET,
			refreshToken: client.credentials.refresh_token || "",
			accessToken: client.credentials.access_token || "",
		},
	});
};

function getAuthenticatedClient(): Promise<OAuth2Client> {
	return new Promise((resolve, reject) => {
		// create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
		// which should be downloaded from the Google Developers Console.
		const oAuth2Client = new OAuth2Client(
			process.env.MAIL_ENGINE_CLIENT_ID,
			process.env.MAIL_ENGINE_CLIENT_SECRET,
			"http://127.0.0.1:3000/oauth"
		);

		// Generate the url that will be used for the consent dialog.
		const authorizeUrl = oAuth2Client.generateAuthUrl({
			access_type: "offline",
			scope: "https://mail.google.com",
		});
		console.log(authorizeUrl)

		// Open an http server to accept the oauth callback. In this simple example, the
		// only request to our webserver is to /oauth2callback?code=<code>
		const server = http
			.createServer(async (req, res) => {
				try {
					if (req.url && req.url.indexOf("/oauth") > -1) {
						// acquire the code from the querystring, and close the web server.
						const qs = new url.URL(req.url, "http://localhost:3000")
							.searchParams;
						const code = qs.get("code");
						console.log(`Code is ${code}`);
						res.end("Authentication successful! Please return to the console.");
						server.destroy();

						// Now that we have the code, use that to acquire tokens.
						const r = await oAuth2Client.getToken(code as string);
						// Make sure to set the credentials on the OAuth2 client.
						oAuth2Client.setCredentials(r.tokens);
						console.info("Tokens acquired.");
						resolve(oAuth2Client);
					}
				} catch (e) {
					reject(e);
				}
			})
			.listen(3000, async () => {
				// open the browser to the authorize url to start the workflow
				// open(authorizeUrl, { wait: false }).then((cp) => cp.unref());
				fetch(authorizeUrl);
				// open(authorizeUrl);

				// console.log("app listening", res);
			});
		destroyer(server);
	});
}

export default createTransporter;
