import dotenv from "dotenv";
import { Camunda8 } from "@camunda8/sdk";
import path from "path"; // we'll use this later

dotenv.config();
console.log(process.env.CAMUNDA_OAUTH_URL);

// const camunda8 = new Camunda8();

// const zeebe = camunda8.getZeebeGrpcApiClient();

// console.log("Starting worker...");
// zeebe.createWorker({
//   taskType: "test-task",
//   taskHandler: (job) => {
//     console.log(`[Zeebe Worker] handling job of type ${job.type}`);
//     return job.complete({
//       serviceTaskOutcome: "We did it!",
//     });
//   },
// });