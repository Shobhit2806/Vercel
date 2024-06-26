import express from "express";
import { S3 } from "aws-sdk";
require("dotenv").config();

const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

const app = express();

app.get("/*", async (req, res) => {
    // id.vercel-demo.com:3001/index.html
    // http://j3hwi.localhost:3001/index.html
    const host = req.hostname;

    const id = host.split(".")[0];
    const filePath = req.path;
    console.log(`dist/${id}${filePath}`,"Hello world");
    
    const contents = await s3.getObject({
        Bucket: "vercel.clone",
        Key: `dist/${id}${filePath}`
    }).promise();
    
    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type", type);

    res.send(contents.Body);
})

app.listen(3001);