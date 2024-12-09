import "./Display.css";
import "./DisplayLink.css";
import {Person} from "../../model";
import {useState} from "react";

function DisplayPerson(person: Person) {
  return (
    <div>
      <div className="names">
        <span className="name">{person.name}</span>
        <span className="surname">{person.surname}</span>
      </div>
      <div className="mail">{person.email}</div>
    </div>
  );
}

function DisplayHidden() {
  return (
    <div className="mystery">?</div>
  );
}

function DisplayLink({person}: { person: Person }) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="box clickable" onClick={() => setHidden(!hidden)}>
      {hidden ? DisplayHidden() : DisplayPerson(person)}
    </div>
  );
}

export default DisplayLink;
