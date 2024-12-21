import styles from "./Manage.module.css";
import {
  AppBar,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography
} from "@mui/material";
import {Person, PersonGroup, Santa, SantaRun, SantaRunExclusion} from "../../model";
import React, {useEffect, useState} from "react";
import {deleteCall, post} from "../../Utils";
import PeopleItem from "./PeopleItem";
import ExclusionManagement from "./ExclusionManagement";
import GroupFilter from "../groupFilter/GroupFilter";
import AddIcon from "@mui/icons-material/Add";

function PersonDialog({person, open, handleClose, availableGroups, onRefreshGroup}:
                      {person?: Person, open: boolean, handleClose: (person: Person | null | undefined) => void,
                        availableGroups: PersonGroup[], onRefreshGroup: () => void}) {
  const [id, setId] = useState<number>();
  const [name, setName] = useState<string>('');
  const [surname, setSurname] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [groups, setGroups] = useState<PersonGroup[]>([]);

  const [newGroupName, setNewGroupName] = useState<string>();
  const [showCreateNewGroup, setShowCreateNewGroup] = useState<boolean>(false);

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    setId(person?.id);
    setName(person?.name || '');
    setSurname(person?.surname || '');
    setEmail(person?.email || '');
    setGroups(person?.groups || []);
  }, [person, open]);

  async function deletePerson() {
    try {
      await deleteCall(`http://localhost:8080/person/people/${person?.id}`);
      handleClose(person);
    } catch (error) {
      handleClose(null);
    }
  }

  async function save() {
    try {
      const savedPerson: Person = await post(`http://localhost:8080/person/people`, {id, name, surname, email, groups});
      if (person) {
        person.name = savedPerson.name;
        person.surname = savedPerson.surname;
        person.email = savedPerson.email;
        person.groups = savedPerson.groups;
      }
      handleClose(savedPerson);
    } catch (error) {
      handleClose(null);
    }
  }

  function onDeleteGroup(group: PersonGroup) {
    setGroups(groups.filter(g => g.id !== group.id));
  }

  function handleAddGroupClose(group?: PersonGroup) {
    setAnchorEl(null);
    if (group) {
      setGroups([...groups, group].sort((a, b) => a.name.localeCompare(b.name)));
    }
  }

  function saveNewGroup() {
    if (!newGroupName || availableGroups.find(g => g.name === newGroupName)) {
      return;
    }
    post(`http://localhost:8080/person/people-group`, {name: newGroupName}).then((res: PersonGroup) => {
      onRefreshGroup();
      setGroups([...groups, res].sort((a, b) => a.name.localeCompare(b.name)));
    });
    setShowCreateNewGroup(false);
  }

  const handleAddGroupClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }

  function onShowCreateNewGroup() {
    setAnchorEl(null);
    setNewGroupName('');
    setShowCreateNewGroup(true);
  }

  return (
    <Dialog onClose={() => handleClose(null)} open={open}>
      <DialogTitle>{person ? 'Edit person' : 'Add new person'}</DialogTitle>
      <div className={styles.dialogContent}>
        <div className={styles.nameFields}>
          <TextField id="name" label="Name" value={name} onChange={e => setName(e.target.value)}/>
          <TextField id="surname" label="Surname" value={surname} onChange={e => setSurname(e.target.value)}/>
        </div>
        <div className={styles.emailFields}>
          <TextField id="email" label="Email" value={email} onChange={e => setEmail(e.target.value)}/>
        </div>
        <div className={styles.groupContent}>
          <div className={styles.groupLabel} title='You can associate the person to some groups, which can then be used as filters to see only certain people'>Group</div>
          {showCreateNewGroup && <div className={styles.createGroup}>
            <TextField value={newGroupName} onChange={e => setNewGroupName(e.target.value)}></TextField>
            <Button disabled={!newGroupName || !!availableGroups.find(g => g.name === newGroupName)}
                    onClick={saveNewGroup}>Save New Group</Button>
          </div>}
          <div className={styles.chips}>
            <div className={styles.addGroup}>
              <IconButton onClick={handleAddGroupClick} color="primary"><AddIcon/></IconButton>
              <Menu anchorEl={anchorEl} open={openMenu} onClose={() => handleAddGroupClose()}>
                <MenuItem onClick={onShowCreateNewGroup}><AddIcon/> Create New Group</MenuItem>
                {availableGroups.filter(g => !groups.find(g2 => g2.id === g.id)).map(group => (
                  <MenuItem key={group.id} onClick={() => handleAddGroupClose(group)}>{group.name}</MenuItem>
                ))}
              </Menu>
            </div>
            {groups.map((group) => (<Chip className={styles.chip} label={group.name} onDelete={() => onDeleteGroup(group)} variant="outlined" color="primary"/>))}
          </div>
        </div>
      </div>
      <div className={styles.dialogFooter}>
        {person?.id ? <Button onClick={() => deletePerson()}>Delete</Button> : <div></div>}
        <Button onClick={() => save()} variant='contained'>Save</Button>
      </div>
    </Dialog>
  );
}

function Manage({peopleList, selectedSanta, selectedRun, onBack, onUpdatedPeopleList, filters, onSetFilters, availableFilters, onRefreshAvailableFilters}:
                  {peopleList: Person[], selectedSanta?: Santa, selectedRun: SantaRun, onBack: (run: SantaRun) => void, onUpdatedPeopleList: (cbk: () => void) => void,
                    filters: PersonGroup[], onSetFilters: (filters: PersonGroup[]) => void,
                  availableFilters: PersonGroup[], onRefreshAvailableFilters: () => void}) {
  const [openPersonDialog, setOpenPersonDialog] = useState<boolean>(false);
  const [selectedPerson, setSelectedPerson] = useState<Person>();
  const [activePeopleList, setActivePeopleList] = useState<Person[]>([]);
  const [filteredPeopleList, setFilteredPeopleList] = useState<Person[]>([]);

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

    gatherData();
    setActivePeopleList(peopleList.filter(p => p.isSelected));
  }

  function filterPeople(filters: PersonGroup[], peopleList: Person[]) {
    if (filters.length === 0) {
      setFilteredPeopleList(peopleList);
    } else {
      setFilteredPeopleList(peopleList.filter(p => p.groups.some(g => filters.find(f => f.id === g.id))));
    }
  }

  useEffect(() => {
    peopleListChanged();
    filterPeople(filters, peopleList);
  }, [peopleList]);

  useEffect(() => {
    filterPeople(filters, peopleList);
  }, [filters]);

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
        selectedRun.peopleList = [...selectedRun.peopleList, {idPeople: person.id, exclusions, mailSent: false, isRemoved: false}];
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

  function save() {
    gatherData();

    peopleList.forEach(p => {
      if (!p.isSelected) {
        return;
      }

      const exclusions = Array.from(new Set([...p.willNotGiveTo.map(p1 => p1.id), ...p.noRelationTo.map(p1 => p1.id)])).map(p1 => ({idPeople: p1}));

      const current = selectedRun.peopleList.find(e => e.idPeople === p.id);
      if (current) { // if element is find, we just update its exclusions
        current.exclusions = exclusions;

        // if peopleTo is excluded not selected, we reset it
        if (current.idPeopleTo === undefined || exclusions.find(e => e.idPeople === current.idPeopleTo) !== undefined || !peopleList.find(e => e.id === current.idPeopleTo)?.isSelected) {
          current.idPeopleTo = undefined;
          current.mailSent = false;
        }

        const peopleFrom = peopleList.find(e => e.id === current.idPeopleFrom);
        if (!peopleFrom?.isSelected || peopleFrom.willNotGiveTo.find(e => e.id === current.idPeople) || peopleFrom.noRelationTo.find(e => e.id === current.idPeople)) {
          current.idPeopleFrom = undefined;
        }
      } else {
        selectedRun.peopleList.push({
          idPeople: p.id,
          exclusions,
          mailSent: false,
          isRemoved: false,
        });
      }
    });
    console.log(selectedRun);
    onBack(selectedRun);
  }

  function gatherData() {
    // set relations on both side
    peopleList.forEach(p => {
      p.willNotGiveTo.forEach(p1 => !p1.willNotReceiveFrom.find(e => e.id === p.id) ? p1.willNotReceiveFrom.push(p) : null);
      p.willNotReceiveFrom.forEach(p1 => !p1.willNotGiveTo.find(e => e.id === p.id) ? p1.willNotGiveTo.push(p) : null);
      p.noRelationTo.forEach(p1 => !p1.noRelationTo.find(e => e.id === p.id) ? p1.noRelationTo.push(p) : null)
    });

    // if notGiveTo + notReceive from -> noRelationTo
    peopleList.forEach(p => {
      const both = p.willNotGiveTo.filter(p1 => p.willNotReceiveFrom.find(e => e.id === p1.id) || p.noRelationTo.find(e => e.id === p1.id));
      both.forEach(p1 => !p.noRelationTo.find(e => e.id === p1.id) ? p.noRelationTo.push(p1) : null);
      p.willNotGiveTo = p.willNotGiveTo.filter(p1 => !both.find(e => e.id === p1.id));
      p.willNotReceiveFrom = p.willNotReceiveFrom.filter(p1 => !both.find(e => e.id === p1.id));
    });

    peopleList.forEach(p => {
      p.willNotGiveTo.sort((a, b) => a.name.localeCompare(b.name));
      p.willNotReceiveFrom.sort((a, b) => a.name.localeCompare(b.name));
      p.noRelationTo.sort((a, b) => a.name.localeCompare(b.name));
    });
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" onClick={() => onBack(selectedRun)}>Back</Button>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Manage {selectedSanta?.name} [{selectedSanta?.secretSantaDate}]
          </Typography>
          <Button color="inherit" onClick={save}>Save</Button>
        </Toolbar>
      </AppBar>
      <div className={styles.manageContent}>
        <div>
          <GroupFilter filters={filters} onSetFilters={onSetFilters} availableFilters={availableFilters}></GroupFilter>
        </div>
        <div className={styles.manageContentSubBlock}>
          <div className={`${styles.peopleMainList} ${styles.block}`}>
            <div className={styles.blockTitle}>
              <h3>People</h3>
              <Button onClick={addPeople}>Add People</Button>
            </div>
            <div className={styles.list}>
              {filteredPeopleList.map((person) => (
                <div key={person.id} className={styles.peopleItem}
                     is-selected={person.id === selectedPerson?.id ? 'true' : 'false'}
                     onClick={() => setSelectedPerson(person)}>
                  <PeopleItem person={person} onToggleActive={isActive => toggleActive(person, isActive)}
                              onEdit={() => editPeople(person)}></PeopleItem>
                </div>
              ))}
            </div>
          </div>
          <div>
            <ExclusionManagement activePeopleList={activePeopleList}
                                 selectedPerson={selectedPerson}></ExclusionManagement>
          </div>
        </div>
      </div>
      <PersonDialog open={openPersonDialog} handleClose={handleCloseEditPerson} person={selectedPerson} availableGroups={availableFilters} onRefreshGroup={onRefreshAvailableFilters}></PersonDialog>
    </div>
  );
}

export default Manage;
