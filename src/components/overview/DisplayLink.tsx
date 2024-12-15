import styleCommon from "./Display.module.css";
import styles from "./DisplayLink.module.css";
import {Person} from "../../model";
import {useState} from "react";
import {IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import LockIcon from '@mui/icons-material/Lock';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import AddPerson from "./AddPerson";

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

function DisplaySetPerson(peopleList: Person[], notInList: number[], addPerson: (p: Person) => void) {
  return (
    <div className={styles.setPerson}>
      <AddPerson peopleList={peopleList} notInList={notInList} addPerson={addPerson}></AddPerson>
    </div>
  );
}

function DisplayLink({person, remove, peopleList, notInList, addPerson, isLocked, onToggleLock}:
                     { person?: Person, remove: (e: React.MouseEvent<HTMLButtonElement>) => void,
                       peopleList: Person[], notInList: number[], addPerson: (p: Person) => void, isLocked?: boolean, onToggleLock?: () => void}) {
  const [hidden, setHidden] = useState(false);

  function onToggleLockInternal(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    if (onToggleLock !== undefined) {
      onToggleLock();
    }
  }

  function lockTitle() {
    return isLocked ? 'Current link is locked and will not be changed even in case of recompute (but recomputation might fail because no available link is left)'
      : 'Current link is set, but might be changed in case of recomputation';
  }

  return (<>
    {person ? (
        <div className={`${styleCommon.container} ${styleCommon.box} ${styles.clickable}`}
             onClick={() => setHidden(!hidden)}>
          {onToggleLock === undefined ? null : <IconButton title={lockTitle()} onClick={onToggleLockInternal} className={styleCommon.actionButton}>
            {isLocked ? <LockIcon/> : <LockOpenIcon/>}
          </IconButton>}
          {hidden ? DisplayHidden() : DisplayPerson(person)}
          <IconButton title="Remove person from Santa List" onClick={remove} className={styleCommon.deleteButton}>
            <CloseIcon/>
          </IconButton>
        </div>
    ) : (
        <div className={`${styleCommon.container}`}>
          {DisplaySetPerson(peopleList, notInList, addPerson)}
        </div>
    )}
  </>);
}

export default DisplayLink;
