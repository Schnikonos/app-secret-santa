
export type SnackbarState = 'success' | 'info' | 'warning' | 'error';

export interface ErrorMessage {
  message: string;
  details?: string;
  err?: any;
}

export interface Person {
  id: number;
  name: string;
  surname: string;
  email: string;
  groups: PersonGroup[];

  isSelected?: boolean;
  willNotReceiveFrom: Person[];
  willNotGiveTo: Person[];
  noRelationTo: Person[];
}

export interface ImportPersonReply {
  idMap: {[id: number]: number};
  newPersons: number[];
}

export interface PersonGroup {
  id?: number;
  name: string;
}

export interface SantaRunExclusion {
  idPeople: number;
}

export interface SantaRunPeople {
  id?: number;
  idPeopleFrom?: number;
  idPeople: number;
  idPeopleTo?: number;
  mailSent: boolean;
  exclusions: SantaRunExclusion[];
  isLocked?: boolean;

  isRemoved: boolean;
}

export interface SantaRun {
  id?: number;
  creationDate?: string;
  lastUpdate?: string;
  peopleList: SantaRunPeople[]
}

export interface Santa {
  id?: number;
  name: string;
  secretSantaDate?: string;
  creationDate?: string;
  lastUpdate?: string;
  mailTemplate?: MailTemplate;

  runs: SantaRun[];
}

export interface AppInfo {
  version: string;
}

export interface MailVariables {
  santaName?: string;
  santaDate?: string;
  fromName?: string;
  fromSurname?: string;
  toName?: string;
  toSurname?: string;
  recipientMailAddress?: string;
}

export interface MailTest {
  mailTemplate?: MailTemplate;
  mailVariables?: MailVariables;
}

export interface ComputeReply {
  santaRun: SantaRun;
  nbChanged: number;
  ok: boolean;
  allowSameFromTo: boolean;
}

export type MailType = 'text' | 'html' | 'eml';

export interface MailTemplate {
  id?: number;
  name?: string;
  title?: string;
  typeMail: MailType;
  isDefault?: boolean;

  template?: string;
  emlFormattedContent?: string;
}

export interface MailReply {
  success: boolean;
  nbMailSuccess: number;
  nbMailError: number;
  idMailsSent: number[];
}

