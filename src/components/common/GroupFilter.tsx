import styles from './GroupFilter.module.css'
import {PersonGroup} from "../../model";
import React, {useEffect, useState} from "react";
import AddIcon from '@mui/icons-material/Add';
import {Chip, IconButton, Menu, MenuItem} from "@mui/material";

function GroupFilter({filters, onSetFilters, availableFilters}:
                     {filters: PersonGroup[], onSetFilters: (filters: PersonGroup[]) => void, availableFilters: PersonGroup[]}) {
  const [selectableFilters, setSelectableFilters] = useState<PersonGroup[]>([])
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const filterIds = filters.map(filter => filter.id);
    setSelectableFilters(availableFilters.filter(f => !filterIds.includes(f.id)));
  }, [filters, availableFilters]);

  function onDelete(filter: PersonGroup) {
    onSetFilters(filters.filter(f => f.id !== filter.id));
  }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (group?: PersonGroup) => {
    setAnchorEl(null);
    if (group) {
      onSetFilters([...filters, group].sort((a, b) => a.name.localeCompare(b.name)));
    }
  };

  return (
    <div className={styles.content}>
      {selectableFilters?.length > 0 && <>
        <IconButton title='Add a group filter to limit the number of people displayed' onClick={handleClick} color="primary"><AddIcon/></IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={() => handleClose()}>
          {selectableFilters.map(group => (
            <MenuItem key={group.id} onClick={() => handleClose(group)}>{group.name}</MenuItem>
          ))}
        </Menu>
      </>}
     <div className={styles.chips}>
       {filters.map((filter) => (
         <Chip className={styles.chip} label={filter.name} onDelete={() => onDelete(filter)} variant="outlined" color="primary"/>
       ))}
     </div>
    </div>
  );
}

export default GroupFilter;