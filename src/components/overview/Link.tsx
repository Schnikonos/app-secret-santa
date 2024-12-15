import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import styles from "./Link.module.css";
import {Person, SantaRunPeople} from "../../model";
import DisplayLink from "./DisplayLink";
import DisplayBasic, {ResultState} from "./DisplayBasic";
import {useEffect, useState} from "react";

function Link({peopleList, santaRunPeopleList, removeFromTo, person, addPeopleList, addPersonFromTo}:
              {peopleList: Person[], santaRunPeopleList: SantaRunPeople[],
                removeFromTo: (from: number | undefined, to: number | undefined) => void, person: SantaRunPeople,
                addPeopleList: Person[],
                addPersonFromTo: (pFrom?: Person, pTo?: Person) => void,
              }) {
  const [people, setPeople] = useState<Person>();
  const [peopleFrom, setPeopleFrom] = useState<Person>();
  const [peopleTo, setPeopleTo] = useState<Person>();
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    setPeople(peopleList.find(p => p.id === person.idPeople));
    setPeopleFrom(peopleList.find(p => p.id === person.idPeopleFrom));
    setPeopleTo(peopleList.find(p => p.id === person.idPeopleTo));
    setIsLocked(!!person.isLocked);
  }, [person, santaRunPeopleList]);

  function removePerson(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    person.isRemoved = true;
    removeFromTo(person.idPeopleFrom, person.idPeople);
    removeFromTo(person.idPeople, person.idPeopleTo);
    setPeopleFrom(undefined);
    setPeopleTo(undefined);
  }

  function removeLinkFrom(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    removeFromTo(person.idPeopleFrom, person.idPeople);
    setPeopleFrom(undefined);
  }

  function removeLinkTo(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    removeFromTo(person.idPeople, person.idPeopleTo);
    setPeopleTo(undefined);
  }

  function computeState(): ResultState {
    if (person.isRemoved) {
      return 'removed';
    }
    if (person.idPeopleFrom !== undefined && person.idPeopleTo !== undefined) {
      return person.mailSent ? 'ok' : 'mailNotSent';
    }
    return 'noFromTo';
  }

  function toggleLock() {
    person.isLocked = !isLocked;
    setIsLocked(!isLocked);
  }

  function sendMail() {

  }

  return <div className={styles.base}>
    <div className={styles.from}>
      <DisplayLink person={peopleFrom} remove={removeLinkFrom} addPerson={(p) => addPersonFromTo(p, people)} peopleList={addPeopleList} notInList={[person.idPeople]}></DisplayLink>
    </div>
    <div className={styles.link}>
      <div hidden={!peopleFrom} className={styles.arrow}><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className={styles.person}>
      {people ? <DisplayBasic person={people} remove={removePerson} resultState={computeState()} sendMail={sendMail} runPerson={person}></DisplayBasic> : <></>}
    </div>
    <div className={styles.link}>
      <div hidden={!peopleTo} className={styles.arrow}><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className={styles.to}>
      <DisplayLink person={peopleTo} remove={removeLinkTo} addPerson={(p) => addPersonFromTo(people, p)} peopleList={addPeopleList} notInList={[person.idPeople]} isLocked={isLocked} onToggleLock={toggleLock}></DisplayLink>
    </div>
  </div>
}

export default Link;
