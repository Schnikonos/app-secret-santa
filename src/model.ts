
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

  runs: SantaRun[];
}

export interface ComputeReply {
  santaRun: SantaRun;
  nbChanged: number;
  ok: boolean;
  allowSameFromTo: boolean;
}

export type MailType = 'text' | 'html' | 'eml';

export interface MailTemplate {
  id: number;
  name: string;
  title: string;
  template: string
  typeMail: MailType;
}

export interface MailReply {
  success: boolean;
  nbMail: number;
}