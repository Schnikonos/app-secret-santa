import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import "./Link.css";
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

  return <div className="base">
    <div className="from">
      {peopleFrom ? <DisplayLink person={peopleFrom}></DisplayLink> : <></>}
    </div>
    <div className="link">
      <div hidden={!peopleFrom} className="arrow"><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className="person">
      {people ? <DisplayBasic person={people}></DisplayBasic> : <></>}
    </div>
    <div className="link">
      <div hidden={!peopleTo} className="arrow"><ArrowRightAltIcon></ArrowRightAltIcon></div>
    </div>
    <div className="to">
      {peopleTo ? <DisplayLink person={peopleTo}></DisplayLink> : <></>}
    </div>
  </div>
}

export default Link;
