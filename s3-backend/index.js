import express from "express";
import cors from "cors";
import "dotenv/config";
import cookieParser from "cookie-parser";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    ListObjectsV2Command,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { v4 as uuidv4 } from "uuid";
import { connectDB } from "./db.js";
import { ProductModel } from "./model/product-model.js";
import userRoutes from "./routes/auth-routes.js";
import verifyUser from "./middleware/auth-middleware.js";
import optionalVerifyUser from "./middleware/optional-auth-middleware.js";

const app = express();
app.use(
    cors({
        origin: "http://localhost:3000",
        credentials: true,
    })
);
app.use(cookieParser());
app.use(express.json());

const port = 3200;

// /**
//  * Initalise the database
//  */
await connectDB();

// /**
//  * Initialise s3 client
//  */
const client = new S3Client({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const createPresignedUrlWithClient = ({ bucket, key }) => {
    const command = new PutObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};
const getPresignedUrlWithClient = ({ bucket, key }) => {
    const command = new GetObjectCommand({ Bucket: bucket, Key: key });
    return getSignedUrl(client, command, { expiresIn: 3600 });
};

app.post("/api/get-presigned-url", verifyUser, async (req, res) => {
    const { mime } = req.body;

    // Get the presigned url from s3
    const filename = uuidv4();
    const finalName = `${filename}.${mime}`;

    const url = await createPresignedUrlWithClient({
        bucket: process.env.S3_BUCKET_NAME,
        key: finalName, //key can be like this also /uploads/user-uploads/filename   s3 pe /folder bnega root me then uske andr user-folder bnega then uske andr image store hoga
    });

    res.json({ url: url, finalName: finalName });
});

app.post("/api/products", verifyUser, async (req, res) => {
    // get data from request
    const { name, description, price, filename, privateProduct } = req.body;

    

    // todo: validate the request using zod
    if (!name || !description || !price || !filename  ) {
        res.json({ message: "All fields are required!" });
        return;
    }

    const product = await ProductModel.create({
        name,
        description,
        price,
        filename,
        privateProduct: privateProduct || false,
    });

    console.log("product", product);

    res.json({ message: "success!" });
});

app.get("/api/products", optionalVerifyUser, async (req, res) => {
    const products = await ProductModel.find({});
    console.log("User in req:", req.user);

    const withUrls = await Promise.all(
        products.map(async (p) => {
            if (!p.privateProduct || req.user) {
                const url = await getPresignedUrlWithClient({
                    bucket: process.env.S3_BUCKET_NAME,
                    key: p.filename,
                });
                return { ...p.toObject(), imageUrl: url };
            } else {
                return { ...p.toObject(), imageUrl: null };
            }
        })
    );

    res.json(withUrls);
});



app.use("/api/auth", userRoutes);

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
