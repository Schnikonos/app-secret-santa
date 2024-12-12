
export interface Person {
  id: number;
  name: string;
  surname: string;
  email: string;

  isSelected?: boolean;
  willNotReceiveFrom: Person[];
  willNotGiveTo: Person[];
  noRelationTo: Person[];
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
