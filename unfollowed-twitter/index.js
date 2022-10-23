import dotenv from "dotenv";
dotenv.config();

import needle from "needle";
import { sendMail } from "./mailing.js";
import { saveObject, getObject } from "./storage.js";

const userId = process.env.userId;
const url = `https://api.twitter.com/2/users/${userId}/followers`;
const bearerToken = process.env.token;

const compare = (users, savedUsers, context) => {
  console.log(users);
  // let existingDiff = getObject("../diff.json", []);
  let existingDiff = context.bindings.currentDiff || [];

  const diff = savedUsers.filter(({ id }) => !users.some(user => user.id === id));

  const newDiff = diff.map(user => ({
    id: user.id,
    username: user.username,
    timestamp: new Date().toISOString(),
  }));

  if (!newDiff.length) {
    console.log("No users unfollowed");
    return;
  }

  console.log("Diff: ", newDiff);

  // saveObject([...existingDiff, ...newDiff], "diff.json", () => console.log("Appended new diff to diff.json"));
  context.bindings.diffBlob = [...existingDiff, ...newDiff];

  try {
    sendMail(JSON.stringify(newDiff, null, 2));
  } catch (error) {
    console.error(error);
  }
};

const getFollowers = async (context, myTimer) => {
  const timeStamp = new Date().toISOString();

  if (myTimer.isPastDue) {
    context.log("JavaScript is running late!");
  }
  context.log("JavaScript timer trigger function ran!", timeStamp);

  let users = [];
  let params = {
    max_results: 1000,
    "user.fields": "created_at",
  };

  const options = {
    headers: {
      authorization: `Bearer ${bearerToken}`,
    },
  };

  let hasNextPage = true;
  let nextToken = null;
  console.log("Retrieving followers...");
  while (hasNextPage) {
    let resp = await getPage(params, options, nextToken);
    if (resp && resp.meta && resp.meta.result_count && resp.meta.result_count > 0) {
      if (resp.data) {
        users.push.apply(users, resp.data);
      }
      if (resp.meta.next_token) {
        nextToken = resp.meta.next_token;
      } else {
        hasNextPage = false;
      }
    } else {
      hasNextPage = false;
    }
  }

  //   console.log(users);
  console.log(`Got ${users.length} users.`);

  // const currentDiff = getObject("../results.json", []);
  const currentResults = context.bindings.currentResults || [];
  console.log(context.bindings.resultsBlob);

  compare(users, currentResults, context);

  // saveObject(users, "results.json", () => console.log("Saved results to results.json"));
  context.bindings.resultsBlob = users;
};

const getPage = async (params, options, nextToken) => {
  if (nextToken) {
    params.pagination_token = nextToken;
  }

  try {
    const resp = await needle("get", url, params, options);

    if (resp.statusCode != 200) {
      console.log(resp);
      console.log(`${resp.statusCode} ${resp.statusMessage}:\n${resp.body}`);
      return;
    }
    return resp.body;
  } catch (err) {
    throw new Error(`Request failed: ${err}`);
  }
};

export default getFollowers;
