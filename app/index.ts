import dotenv from "dotenv";
import { Camunda8 } from "@camunda8/sdk";
import path from "path"; // we'll use this later
import axios from "axios";

dotenv.config({ path: path.resolve(__dirname, "../.env")});

const camunda8 = new Camunda8();

const zeebe = camunda8.getZeebeGrpcApiClient();

console.log("Starting worker...");
zeebe.createWorker({
  taskType: "task-abrechnungzustellen",
  taskHandler: async (job) => {
    const response = await axios.get(`https://my-json-server.typicode.com/GAFMONKEY/abgabe5/mitarveiter?id=${job.variables.pers_nummer}`);
    console.log(response.data);
    console.log(`[Zeebe Worker] handling job of type ${job.type} with employee id ${job.variables.pers_nummer}`);
    return job.complete({
      serviceTaskOutcome: "We did it!",
    });
  },
});

zeebe.createWorker({
  taskType: "task-reisekostenerstatten",
  taskHandler: (job) => {
    console.log(`[Zeebe Worker] handling job of type ${job.type}`);
    return job.complete({
      serviceTaskOutcome: "We did it!",
    });
  },
});

zeebe.createWorker({
  taskType: "task-unterlagenarchivieren",
  taskHandler: (job) => {
    console.log(`[Zeebe Worker] handling job of type ${job.type}`);
    return job.complete({
      serviceTaskOutcome: "We did it!",
    });
  },
});