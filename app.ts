import "dotenv/config";
import { createApplication } from "./server/createApplication.js";

const app = createApplication();

export default app;
