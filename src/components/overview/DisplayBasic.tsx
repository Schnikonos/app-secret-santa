import styleCommon from "./Display.module.css";
import {Person} from "../../model";

function DisplayBasic({person}: {person: Person}) {
  function buildTitle() {
    const base = `${person.name} ${person.surname}\n${person.email}`;
    const willNotGiveTo = person.willNotGiveTo ? '\n' + JSON.stringify(person.willNotGiveTo.map(e => `${e.name}-${e.surname}`)) : ''
    const noRelationTo = person.noRelationTo ? '\n' + JSON.stringify(person.noRelationTo.map(e => `${e.name}-${e.surname}`)) : ''
    const willNotReceiveFrom = person.willNotReceiveFrom ? '\n' + JSON.stringify(person.willNotReceiveFrom.map(e => `${e.name}-${e.surname}`)) : ''
    return base + willNotGiveTo + willNotReceiveFrom + noRelationTo;
  }

  return (
    <div className={styleCommon.box}>
      <div title={buildTitle()}>
        <div className={styleCommon.names}>
          <span className={styleCommon.name}>{person.name}</span>
          <span className={styleCommon.surname}>{person.surname}</span>
        </div>
        <div className={styleCommon.email}>{person.email}</div>
      </div>
    </div>
  );
}

export default DisplayBasic;
