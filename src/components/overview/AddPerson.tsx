import {Person} from "../../model";
import {Button, Menu, MenuItem} from "@mui/material";
import React, {useEffect} from "react";

function AddPerson({peopleList, notInList, addPerson}: {peopleList: Person[], notInList: number[], addPerson: (p: Person) => void}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [possibleList, setPossibleList] = React.useState<Person[]>([]);
  const open = Boolean(anchorEl);

  useEffect(() => {
    setPossibleList(peopleList.filter(p => !notInList.includes(p.id)));
  }, [peopleList, notInList]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (person?: Person) => {
    setAnchorEl(null);
    if (person) {
      addPerson(person);
    }
  };

  return (
    <>
      <Button onClick={handleClick} disabled={possibleList.length === 0}>Add Person</Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
        {possibleList.map(person => (
          <MenuItem key={person.id} onClick={() => handleClose(person)}>{person.name} {person.surname}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default AddPerson;