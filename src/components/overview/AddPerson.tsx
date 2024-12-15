import {Person} from "../../model";
import {Button, Menu, MenuItem} from "@mui/material";
import React from "react";

function AddPerson({peopleList, notInList, addPerson}: {peopleList: Person[], notInList: number[], addPerson: (p: Person) => void}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

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
      <Button onClick={handleClick}>Add Person</Button>
      <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
        {peopleList.filter(p => !notInList.includes(p.id)).map(person => (
          <MenuItem key={person.id} onClick={() => handleClose(person)}>{person.name} {person.surname}</MenuItem>
        ))}
      </Menu>
    </>
  );
}

export default AddPerson;