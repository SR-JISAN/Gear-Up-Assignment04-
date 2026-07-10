import cookieParser from "cookie-parser";
import express, { Application, Request, Response } from "express";
import cors from "cors"
import config from "./config";
import { userRoute } from "./modules/users/user.route";
import { authRoute } from "./modules/auth/auth.route";
import { productRoute } from "./modules/products/product.route";
import { orderRoute } from "./modules/rentalOrders/order.route";
import { paymentsRoute } from "./modules/payments/payment.route";

const app :Application = express();


app.use(cors({
    origin : config.app_url,
    credentials : true
}));

app.post("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/",(req : Request,res : Response)=>{
    res.send("Welcome, To Gear Up Backend Server");
})

app.use("/api/users", userRoute);

app.use("/api/auth", authRoute);

app.use("/api/products", productRoute);

app.use("/api/orders", orderRoute);

app.use("/api/payments",paymentsRoute);

export default app;
