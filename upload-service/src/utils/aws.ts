import { S3 } from "aws-sdk";
import fs from "fs";
require("dotenv").config();
const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// fileName => output/12312/src/App.jsx
// filePath => /Users/shobhitgarg/vercel/dist/output/12312/src/App.jsx
export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel.clone",
      Key: fileName,
    })
    .promise();
  console.log(response);
};
