import "./Manage.css";
import {AppBar, Button, Dialog, DialogTitle, TextField, Toolbar, Typography} from "@mui/material";
import {Person, Santa, SantaRun, SantaRunExclusion} from "../../model";
import {useEffect, useState} from "react";
import {deleteCall, post} from "../../Utils";
import PeopleItem from "./PeopleItem";
import ExclusionManagement from "./ExclusionManagement";

function PersonDialog({person, open, handleClose}: {person?: Person, open: boolean, handleClose: (person: Person | null | undefined) => void}) {
  const [id, setId] = useState<number>();
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  useEffect(() => {
    setId(person?.id);
    setName(person?.name ? person?.name : '');
    setSurname(person?.surname ? person?.surname : '');
    setEmail(person?.email ? person?.email : '');
  }, [person, open]);

  async function deletePerson() {
    try {
      await deleteCall(`http://localhost:8080/people/${person?.id}`);
      handleClose(person);
    } catch (error) {
      handleClose(null);
    }
  }

  async function save() {
    try {
      const savedPerson: Person = await post(`http://localhost:8080/people`, {id, name, surname, email});
      if (person) {
        person.name = savedPerson.name;
        person.surname = savedPerson.surname;
        person.email = savedPerson.email;
      }
      handleClose(savedPerson);
    } catch (error) {
      handleClose(null);
    }
  }

  return (
    <Dialog onClose={() => handleClose(null)} open={open}>
      <DialogTitle>{person ? 'Edit person' : 'Add new person'}</DialogTitle>
      <div className="dialog-content">
        <div className="name-fields">
          <TextField id="name" label="Name" value={name} onChange={e => setName(e.target.value)}/>
          <TextField id="surname" label="Surname" value={surname} onChange={e => setSurname(e.target.value)}/>
        </div>
        <div className="email-fields">
          <TextField id="email" label="Email" value={email} onChange={e => setEmail(e.target.value)}/>
        </div>
      </div>
      <div className="dialog-footer">
        {person?.id ? <Button onClick={() => deletePerson()}>Delete</Button> : <div></div>}
        <Button onClick={() => save()}>Save</Button>
      </div>
    </Dialog>
  );
}

function Manage({peopleList, selectedSanta, selectedRun, onBack, onUpdatedPeopleList}:
                  {peopleList: Person[], selectedSanta?: Santa, selectedRun: SantaRun, onBack: () => void, onUpdatedPeopleList: (cbk: () => void) => void}) {
  const [openPersonDialog, setOpenPersonDialog] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<Person>();
  const [activePeopleList, setActivePeopleList] = useState<Person[]>([]);

  function peopleListChanged() {
    selectedRun.peopleList = selectedRun.peopleList.filter(p => peopleList.find(p2 => p2.id === p.idPeople) !== undefined);
    const peopleRunList = selectedRun.peopleList;

    for (const runPeople of peopleRunList) {
      runPeople.exclusions = runPeople.exclusions.filter(e => peopleList.find(p2 => p2.id === e.idPeople) !== undefined)
    }

    for (const people of peopleList) {
      people.isSelected = false;
      people.noRelationTo = [];
      people.willNotGiveTo = [];
      people.willNotReceiveFrom = [];
    }

    for (const people of peopleList) {
      const peopleRun = peopleRunList.find(p => p.idPeople === people.id);
      if (!peopleRun) {
        continue;
      }

      people.isSelected = true;
      for (const exclusion of peopleRun.exclusions) {
        const peopleExcluded = peopleList.find(p => p.id === exclusion.idPeople);
        if (!peopleExcluded) {
          continue;
        }
        people.willNotGiveTo.push(peopleExcluded);
        peopleExcluded.willNotReceiveFrom.push(people);
      }
    }

    for (const people of peopleList) {
      const noFromTo = people.willNotReceiveFrom.filter(p1 => people.willNotGiveTo.find(p2 => p2.id === p1.id) !== undefined);
      for (const person of noFromTo) {
        people.noRelationTo.push(person);
        person.noRelationTo.push(people);
        people.willNotReceiveFrom = people.willNotReceiveFrom.filter(p => p.id !== person.id);
        people.willNotGiveTo = people.willNotGiveTo.filter(p => p.id !== person.id);
        person.willNotReceiveFrom = person.willNotReceiveFrom.filter(p => p.id !== people.id);
        person.willNotGiveTo = person.willNotGiveTo.filter(p => p.id !== people.id);
      }
    }

    setActivePeopleList(peopleList.filter(p => p.isSelected));
  }

  useEffect(() => {
    peopleListChanged();
  }, [peopleList]);

  function handleCloseEditPerson(person?: Person | null) {
    setOpenPersonDialog(false);
    if (!person) {
      return;
    }
    onUpdatedPeopleList(() => {});
  }

  function toggleActive(person: Person, isActive: boolean) {
    if (!person) {
      return;
    }
    person.isSelected = isActive;
    if (isActive) {
      if (activePeopleList.find(p => p.id === person.id) === undefined) {
        setActivePeopleList([...activePeopleList, person].sort((a, b) => a.name.localeCompare(b.name)));
      }
      if (selectedRun.peopleList.find(p => p.idPeople === person.id) === undefined) {
        const exclusions: SantaRunExclusion[] = [...person.willNotGiveTo.map(p => ({idPeople: p.id})), ...person.noRelationTo.map(p => ({idPeople: p.id}))];
        selectedRun.peopleList = [...selectedRun.peopleList, {idPeople: person.id, exclusions: [], mailSent: false}];
      }
    } else if (!isActive) {
      setActivePeopleList(activePeopleList.filter(p => p.id !== person.id))
      selectedRun.peopleList = selectedRun.peopleList.filter(p => p.idPeople !== person.id)
    }
  }

  function addPeople() {
    setSelectedPerson(undefined);
    setOpenPersonDialog(true);
  }

  function editPeople(person: Person) {
    setSelectedPerson(person);
    setOpenPersonDialog(true);
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={onBack}>Back</Button>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Manage {selectedSanta?.name}
          </Typography>
          <Button color="inherit">Save</Button>
        </Toolbar>
      </AppBar>
      <div className="manage-content">
        <div className="people-main-list block">
          <div className="block-title">
            <h3>People</h3>
            <Button onClick={addPeople}>Add People</Button>
          </div>
          <div className="list">
            {peopleList.map((person) => (
              <div key={person.id} className="people-item" is-selected={person.id === selectedPerson?.id ? 'true' : 'false'} onClick={() => setSelectedPerson(person)}>
                <PeopleItem person={person} onToggleActive={isActive => toggleActive(person, isActive)} onEdit={() => editPeople(person)}></PeopleItem>
              </div>
            ))}
          </div>
        </div>
        <div>
          <ExclusionManagement activePeopleList={activePeopleList} selectedPerson={selectedPerson}></ExclusionManagement>
        </div>
      </div>
      <PersonDialog open={openPersonDialog} handleClose={handleCloseEditPerson} person={selectedPerson}></PersonDialog>
    </div>
  );
}

export default Manage;
