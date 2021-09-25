import express from "express";
import { serve, setup } from "swagger-ui-express";

import docs from "./api-docs.json";
import { usersRoutes } from "./routes/users.routes";

const app = express();

app.use(express.json());

app.use("/api-docs", serve, setup(docs));
app.use("/users", usersRoutes);

export { app };
