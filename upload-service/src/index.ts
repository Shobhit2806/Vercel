import express from "express";
import cors from "cors";
import path from "path";
import { simpleGit } from "simple-git";
import { generateRandomId } from "./utils/generateRandomId";
import { getAllFiles } from "./utils/getAllFiles";
import { uploadFile } from "./utils/aws";
import { createClient } from "redis";

const publisher = createClient();
publisher.connect();
const subscriber = createClient();
subscriber.connect();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/status", async (req, res) => {
  const id = req.query.id;
  const response = await subscriber.hGet("status", id as string);
  res.json({
    status: response,
  });
});

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generateRandomId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  // files.forEach(async (file) => {
  //   await uploadFile(file.slice(__dirname.length + 1), file);
  // });

  // @ts-ignore
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  publisher.lPush("build-queue", id);
  publisher.hSet("status", id, "uploaded");
  console.log(files);

  res.json({
    id,
  });
});

app.listen(3000);
