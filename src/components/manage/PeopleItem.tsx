import styles from "./PeopleItem.module.css";
import EditIcon from '@mui/icons-material/Edit';
import {Person} from "../../model";
import {Checkbox, IconButton} from "@mui/material";
import React from "react";

function PeopleItem({person, onToggleActive, onEdit}: {person: Person, onToggleActive: (isActive: boolean) => void, onEdit: () => void}) {
  return (
    <div className={styles.item}>
      <Checkbox checked={!!person.isSelected} onChange={e => onToggleActive(e.target.checked)}></Checkbox>
      <div className={styles.info} title={`${person.name} - ${person.surname}\n${person.email}`}>
        <div className={styles.fullname}><span className={styles.name}>{person.name}</span> <span className={styles.surname}>{person.surname}</span></div>
        <div className={styles.email}>{person.email}</div>
      </div>
      <IconButton onClick={onEdit}><EditIcon/></IconButton>
    </div>
  );
}

export default PeopleItem;
