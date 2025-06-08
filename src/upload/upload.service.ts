import { Storage } from "@google-cloud/storage";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { MulterFile } from "./interfaces/upload-file.interface";

@Injectable()
export class UploadService {
  private storage: Storage;
  private bucketName: string;

  constructor(private config: ConfigService) {
    const projectId = config.get<string>("GCS_PROJECT_ID");
    const credentialsJson = config.get<string>("GCS_CREDENTIALS_JSON");
    const bucketName = config.get<string>("GCS_BUCKET_NAME");

    if (!projectId || !credentialsJson || !bucketName) {
      throw new Error("GCS environment variables are not set properly.");
    }

    const credentials = JSON.parse(credentialsJson) as {
      client_email: string;
      private_key: string;
    };

    this.storage = new Storage({
      projectId,
      credentials,
    });

    this.bucketName = bucketName;
  }

  async uploadFile(file: MulterFile): Promise<string> {
    if (
      !file ||
      typeof file.originalname !== "string" ||
      !(file.buffer instanceof Buffer) ||
      typeof file.mimetype !== "string"
    ) {
      throw new InternalServerErrorException("Invalid file");
    }

    const bucket = this.storage.bucket(this.bucketName);
    const filename = `${uuidv4()}${path.extname(file.originalname)}`;
    const fileUpload = bucket.file(filename);

    const stream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      stream.on("error", (err: Error) => {
        reject(new InternalServerErrorException(err.message));
      });

      stream.on("finish", () => {
        fileUpload
          .makePublic()
          .then(() => {
            const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${filename}`;
            resolve(publicUrl);
          })
          .catch((err) => {
            reject(new InternalServerErrorException((err as Error).message));
          });
      });

      stream.end(file.buffer);
    });
  }
}
