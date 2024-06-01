import express from "express";
import cors from "cors";
import path from "path";
import { simpleGit } from "simple-git";
import { generateRandomId } from "./generateRandomId";
import { getAllFiles } from "./getAllFiles";
import { uploadFile } from "./aws";
const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  const id = generateRandomId();
  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  console.log(files);
  
  res.json({
    id,
  });
});

app.listen(3000);
