import styleCommon from "./Display.module.css";
import styles from "./DisplayLink.module.css";
import {Person} from "../../model";
import {useState} from "react";

function DisplayPerson(person: Person) {
  return (
    <div>
      <div className={styleCommon.names}>
        <span className={styleCommon.name}>{person.name}</span>
        <span className={styleCommon.surname}>{person.surname}</span>
      </div>
      <div className={styleCommon.email}>{person.email}</div>
    </div>
  );
}

function DisplayHidden() {
  return (
    <div className={styles.mystery}>?</div>
  );
}

function DisplayLink({person}: { person: Person }) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className={`${styleCommon.box} ${styles.clickable}`} onClick={() => setHidden(!hidden)}>
      {hidden ? DisplayHidden() : DisplayPerson(person)}
    </div>
  );
}

export default DisplayLink;
