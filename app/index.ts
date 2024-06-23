import dotenv from "dotenv";
import { Camunda8 } from "@camunda8/sdk";
import path from "path"; // we'll use this later
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { Abrechnung, Mitarbeiter } from "./types";

dotenv.config({ path: path.resolve(__dirname, "../.env")});

const camunda8 = new Camunda8();

const zeebe = camunda8.getZeebeGrpcApiClient();

console.log("Starting worker...");

zeebe.createWorker({
  taskType: "task-reisekostenerstatten",
  taskHandler: async (job) => {
    try {
      const mitarbeiterNr = job.variables.pers_nummer.toString();
      const response = await axios.get(`https://my-json-server.typicode.com/GAFMONKEY/abgabe5/mitarbeiter/${mitarbeiterNr}`);
      if(response.status !== 200) {
        return job.error("Mitarbeiter nicht gefunden!");
      }
      const gesamtbetrag = (Number(job.variables.tatsaechlichekosten) + Number(job.variables.gesamtspesen)).toFixed(2);
      const mitarbeiter: Mitarbeiter = response.data;
      console.log(`Überweisung an ${mitarbeiter.name} mit ${mitarbeiter.iban} in Höhe von ${gesamtbetrag}€ durchgeführt.`);

      return job.complete({
        serviceTaskOutcome: "Überweisung erfolgreich durchgeführt",
      });
    } catch (error) {
      console.error(error);
      return job.error("An error occurred while processing the job!");
    }
  },
});

zeebe.createWorker({
  taskType: "task-abrechnungzustellen",
  taskHandler: async (job) => {
    try {
      const mitarbeiterNr = job.variables.pers_nummer.toString();
      const response = await axios.get(`https://my-json-server.typicode.com/GAFMONKEY/abgabe5/mitarbeiter/${mitarbeiterNr}`);
      if(response.status !== 200) {
        return job.error("Mitarbeiter nicht gefunden!");
      }
      const mitarbeiterEmail = response.data.email;
      
      console.log(`Abrechnung an ${mitarbeiterEmail} gesendet.`);

      return job.complete({
        serviceTaskOutcome: "Abrechnung erforlgreich zugestellt",
      });
    } catch (error) {
      console.error(error);
      return job.error("An error occurred while processing the job.");
    }
  },
});

zeebe.createWorker({
  taskType: "task-unterlagenarchivieren",
  taskHandler: async (job) => {
    try {
      const mitarbeiter = job.variables.pers_nummer.toString();
      
      const abteilung = job.variables.abteilung.toString();
      let projekt = job.variables.projekt??undefined;
      const kostenstelle = projekt === undefined ? 
        (await axios.get(`https://my-json-server.typicode.com/GAFMONKEY/abgabe5/abteilungen/${abteilung}`)).data.kostenstelle :
        (await axios.get(`https://my-json-server.typicode.com/GAFMONKEY/abgabe5/projekte/${projekt}`)).data.kostenstelle;
      const betrag = (Number(job.variables.tatsaechlichekosten) + Number(job.variables.gesamtspesen)).toFixed(2);
      if(!projekt) {
        projekt = "null";
      }
      const abrechnung: Abrechnung = {
        id: uuidv4().toString(),
        mitarbeiter,
        projekt: projekt.toString(),
        abteilung,
        kostenstelle,
        betrag,
      };

      const postResponse = await axios.post("https://my-json-server.typicode.com/GAFMONKEY/abgabe5/abrechnungen", abrechnung);
      if(postResponse.status !== 201) {
        return job.error("Fehler beim Schreiben der Abrechnung in die Datenbank!");
      }
      console.log(`Abrechnung für Mitarbeiter ${mitarbeiter} archiviert.`);
      return job.complete({
        serviceTaskOutcome: "Abrechnung erforlgreich zugestellt!",
      });
    } catch (error) {
      console.error(error);
      return job.error("An error occurred while processing the job!");
    }
  },
});