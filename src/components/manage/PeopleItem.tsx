import "./PeopleItem.css";
import EditIcon from '@mui/icons-material/Edit';
import {Person} from "../../model";
import {Checkbox, IconButton} from "@mui/material";
import React from "react";

function PeopleItem({person, onToggleActive, onEdit}: {person: Person, onToggleActive: (isActive: boolean) => void, onEdit: () => void}) {
  return (
    <div className="item">
      <Checkbox checked={!!person.isSelected} onChange={e => onToggleActive(e.target.checked)}></Checkbox>
      <div className="info" title={`${person.name} - ${person.surname}\n${person.email}`}>
        <div className="fullname"><span className="name">{person.name}</span> <span className="surname">{person.surname}</span></div>
        <div className="email">{person.email}</div>
      </div>
      <IconButton onClick={onEdit}><EditIcon/></IconButton>
    </div>
  );
}

export default PeopleItem;
