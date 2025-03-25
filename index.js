import express from "express";

import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";

import contractRoutes from "./routes/contracts.js";
import dashboardRoutes from "./routes/dashboard.js";

import { errorHandler } from "./middleware/errorHandler.js";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import { app } from "./config/index.js";
import { server } from "./wss/index.js";

dotenv.config();

const swaggerDocument = YAML.load("./swagger.yaml");

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
// After your routes
app.use(errorHandler);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use("/contracts", contractRoutes);
app.use("/", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Contract API is running");
});

server.listen(PORT, () => {
  console.log(`Server + WebSocket running on port ${PORT}`);
});
