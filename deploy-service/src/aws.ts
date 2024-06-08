import { S3 } from "aws-sdk";
import fs from "fs";
import path from "path";
require("dotenv").config();
const s3 = new S3({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
});

// output/asdasd
export async function downloadS3Folder(prefix: string) {
  try {
    const allFiles = await s3.listObjectsV2({
      Bucket: "vercel.clone",
      Prefix: prefix,
    }).promise();

    const downloadPromises = allFiles.Contents?.map(async ({ Key }) => {
      if (!Key) return Promise.resolve();
      
      const finalOutputPath = path.join(__dirname, Key);
      const outputFile = fs.createWriteStream(finalOutputPath);
      const dirName = path.dirname(finalOutputPath);
      
      if (!fs.existsSync(dirName)) {
        fs.mkdirSync(dirName, { recursive: true });
      }

      const getObjectParams = {
        Bucket: "vercel.clone",
        Key,
      };

      await new Promise((resolve, reject) => {
        s3.getObject(getObjectParams)
          .createReadStream()
          .pipe(outputFile)
          .on("error", reject)
          .on("finish", resolve);
      });
    }) || [];

    console.log("Awaiting download completion...");
    await Promise.all(downloadPromises);
    console.log("All files downloaded successfully.");
  } catch (error) {
    console.error("Error occurred during download:", error);
    throw error; // Propagate error upwards if needed
  }
}


export function copyFinalDist(id: string) {
  const folderPath = path.join(__dirname, `output/${id}/build`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(file => {
      uploadFile(`build/${id}/` + file.slice(folderPath.length + 1), file);
  })
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = fs.readdirSync(folderPath);
  allFilesAndFolders.forEach(file => {
      const fullFilePath = path.join(folderPath, file);
      if (fs.statSync(fullFilePath).isDirectory()) {
          response = response.concat(getAllFiles(fullFilePath))
      } else {
          response.push(fullFilePath);
      }
  });
  return response;
}

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3.upload({
      Body: fileContent,
      Bucket: "vercel.clone",
      Key: fileName,
  }).promise();
  console.log(response);
}