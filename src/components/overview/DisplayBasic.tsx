import "./Display.css";
import "./DisplayBasic.css";
import {Person} from "../../model";

function DisplayBasic({person}: {person: Person}) {
  return (
    <div className="box">
      <div>
        <div className="names">
          <span className="name">{person.name}</span>
          <span className="surname">{person.surname}</span>
        </div>
        <div className="mail">{person.email}</div>
      </div>
    </div>
  );
}

export default DisplayBasic;
