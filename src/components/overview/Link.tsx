import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import styles from "./Link.module.css";
import {Person, SantaRunPeople} from "../../model";
import DisplayLink from "./DisplayLink";
import DisplayBasic from "./DisplayBasic";
import {useEffect, useState} from "react";

function Link({person, peopleList}: {person: SantaRunPeople, peopleList: Person[]}) {
  const [people, setPeople] = useState<Person>();
  const [peopleFrom, setPeopleFrom] = useState<Person>();
  const [peopleTo, setPeopleTo] = useState<Person>();

  useEffect(() => {
    setPeople(peopleList.find(p => p.id === person.idPeople));
    if (person.idPeopleFrom) {
      setPeopleFrom(peopleList.find(p => p.id === person.idPeopleFrom));
    }
    if (person.idPeopleTo) {
      setPeopleTo(peopleList.find(p => p.id === person.idPeopleTo));
    }
  }, [person]);

  return <div className={styles.base}>
    <div className={styles.from}>
      {peopleFrom ? <DisplayLink person={peopleFrom}></DisplayLink> : <></>}
    </div>
    <div className={styles.link}>
      <div hidden={!peopleFrom} className={styles.arrow}><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className={styles.person}>
      {people ? <DisplayBasic person={people}></DisplayBasic> : <></>}
    </div>
    <div className={styles.link}>
      <div hidden={!peopleTo} className={styles.arrow}><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className={styles.to}>
      {peopleTo ? <DisplayLink person={peopleTo}></DisplayLink> : <></>}
    </div>
  </div>
}

export default Link;
