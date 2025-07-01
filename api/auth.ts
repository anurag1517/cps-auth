// api/[auth].ts
import app from "../server/src/app";
import serverless from "serverless-http";

export default serverless(app);
