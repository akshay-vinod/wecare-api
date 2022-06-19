const functions = require("firebase-functions");
const { Storage } = require("@google-cloud/storage");
const { google } = require("googleapis");
const ml = google.ml("v1");
const path = require("path");
const fs = require("fs");
const cwd = path.join(__dirname, "..");

exports.predict = functions.https.onRequest(async (request, response) => {
  const { credential } = await google.auth.getApplicationDefault();
  const storage = new Storage();
  const destinationPath = path.join(cwd, "downloaded.txt");
  const options = {
    destination: destinationPath,
  };
  await storage
    .bucket("gs://wecare-91599.appspot.com/")
    .file(request.query.data + ".txt")
    .download(options);
  var textContent = "";
  await fs.readFile(destinationPath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    textContent = data;
  });
  const instances = [[textContent]];
  const preds = await ml.projects.predict({
    auth: credential,
    name: "projects/wecaregcp/models/finalmodel",
    requestBody: {
      instances,
    },
  });
  response.send(JSON.stringify(preds.data));
});
