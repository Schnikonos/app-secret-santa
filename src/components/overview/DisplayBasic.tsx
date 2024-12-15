import styleCommon from "./Display.module.css";
import CloseIcon from '@mui/icons-material/Close';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import {Person, SantaRunPeople} from "../../model";
import {IconButton} from "@mui/material";

export type ResultState = 'ok' | 'noFromTo' | 'removed' | 'mailNotSent';

function DisplayBasic({person, runPerson, remove, resultState, sendMail}: {person: Person, runPerson: SantaRunPeople, remove: (e: React.MouseEvent<HTMLButtonElement>) => void, resultState: ResultState, sendMail: (p: Person) => void}) {
  function buildTitle() {
    const base = `[${resultState}] - ${person.name} ${person.surname}\n${person.email}`;
    const willNotGiveTo = person.willNotGiveTo ? '\nWill not give to: ' + JSON.stringify(person.willNotGiveTo.map(e => `${e.name}-${e.surname}`)) : ''
    const noRelationTo = person.noRelationTo ? '\nNo relation to: ' + JSON.stringify(person.noRelationTo.map(e => `${e.name}-${e.surname}`)) : ''
    const willNotReceiveFrom = person.willNotReceiveFrom ? '\nWill not receive from: ' + JSON.stringify(person.willNotReceiveFrom.map(e => `${e.name}-${e.surname}`)) : ''
    return base + willNotGiveTo + willNotReceiveFrom + noRelationTo;
  }

  function sendMailInternal(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    sendMail(person);
  }

  return (
    <div className={`${styleCommon.container} ${styleCommon.box}`} result-state={resultState}>
      <IconButton title="Send mail" onClick={sendMailInternal} className={styleCommon.actionButton} disabled={runPerson.idPeopleTo === undefined}>
        <MailOutlineIcon/>
      </IconButton>
      <div title={buildTitle()}>
        <div className={styleCommon.names}>
          <span className={styleCommon.name}>{person.name}</span>
          <span className={styleCommon.surname}>{person.surname}</span>
        </div>
        <div className={styleCommon.email}>{person.email}</div>
      </div>
      <IconButton title="Remove person from Santa List" onClick={remove} className={styleCommon.deleteButton}>
        <CloseIcon/>
      </IconButton>
    </div>
  );
}

export default DisplayBasic;
