export interface Abrechnung {
  id: string;
  mitarbeiter: string;
  projekt: string;
  abteilung: string;
  kostenstelle: string;
  betrag: string;
};

export interface Mitarbeiter {
  id: string,
  abteilung: string,
  projekt: string,
  name: string,
  email: string,
  iban: string
}

