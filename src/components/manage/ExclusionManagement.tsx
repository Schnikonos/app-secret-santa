import styles from "./ExclusionManagement.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import {Person} from "../../model";
import {IconButton} from "@mui/material";
import {useEffect, useReducer, useState} from "react";

function ExclusionManagement({selectedPerson, activePeopleList}: {selectedPerson?: Person, activePeopleList: Person[]}) {
  const [filteredActivePeopleList, setFilteredActivePeopleList] = useState<Person[]>([]);
  const [selectedItems, setSelectedItems] = useState<Person[]>([]);
  const [, forceUpdate] = useReducer(x => x + 1, 0, () => 0);

  useEffect(() => {
    setFilteredActivePeopleList(activePeopleList.filter(p => p.id !== selectedPerson?.id));
  }, [selectedPerson, activePeopleList]);

  function handleItemClick(item: Person, e: any) {
    if (e.ctrlKey || e.metaKey) {
      // Add/remove item from selection
      setSelectedItems((prev) =>
        prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
      );
    } else if (e.shiftKey) {
      // Select a range of items (Shift + Click)
      const startIndex = filteredActivePeopleList.indexOf(selectedItems[0] || item);
      const endIndex = filteredActivePeopleList.indexOf(item);
      const range = filteredActivePeopleList.slice(Math.min(startIndex, endIndex), Math.max(startIndex, endIndex) + 1);
      setSelectedItems(range);
    } else {
      // Single selection
      setSelectedItems([item]);
    }
  }

  function handleDragStart(item: Person) {
    if (selectedItems.length === 0) {
      // If no items are selected, select the dragged item
      setSelectedItems([item]);
    }
  }

  function handleDragOver(event: any) {
    event.preventDefault();
  }

  function getListStuff(mode: string) {
    if (!selectedPerson) {
      return {list: [], setter: (list: Person[]) => {}};
    }
    if (mode === 'from') {
      return {list: selectedPerson.willNotReceiveFrom, setter: (list: Person[]) => {selectedPerson.willNotReceiveFrom = list}};
    } else if (mode === 'both') {
      return {list: selectedPerson.noRelationTo, setter: (list: Person[]) => {selectedPerson.noRelationTo = list}};
    } else if (mode === 'to') {
      return {list: selectedPerson.willNotGiveTo, setter: (list: Person[]) => {selectedPerson.willNotGiveTo = list}};
    } else {
      return {list: [], setter: () => {}};
    }
  }

  function handleDrop(event: any, mode: string) {
    event.preventDefault();
    const {list, setter} = getListStuff(mode);
    const filteredSelectedItems = selectedItems.filter(p => list.find(e => e.id === p.id) === undefined);
    setter([...list, ...filteredSelectedItems].sort((a, b) => a.name.localeCompare(b.name)));
    setSelectedItems([]);
  }

  function removeElement(item: Person, mode: string) {
    if (!selectedPerson) {
      return;
    }
    const {list, setter} = getListStuff(mode);
    setter(list.filter(p => p.id !== item.id));
    forceUpdate();
  }

  return (
    <div className={styles.container}>
      <div className={`${styles.peopleExclusions} ${styles.block}`}>
        <div className={styles.exclusionFrom} onDrop={(e) => handleDrop(e, 'from')} onDragOver={handleDragOver}>
          <div className={styles.blockTitle}>
            Will not receive gifts from
          </div>
          <div className={styles.blockContent}>
            {selectedPerson?.willNotReceiveFrom.map(el => (
              <div key={el.id} className={styles.excludedItem}>
                <IconButton onClick={() => removeElement(el, 'from')}><DeleteIcon/></IconButton>
                <span className={styles.name}>{el.name}</span> <span className={styles.surname}>{el.surname}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.exclusionBoth} onDrop={(e) => handleDrop(e, 'both')} onDragOver={handleDragOver}>
          <div className={styles.blockTitle}>
            Will not receive nor give gifts to
          </div>
          <div className={styles.blockContent}>
            {selectedPerson?.noRelationTo.map(el => (
              <div key={el.id} className={styles.excludedItem}>
                <IconButton onClick={() => removeElement(el, 'both')}><DeleteIcon/></IconButton>
                <span className={styles.name}>{el.name}</span> <span className={styles.surname}>{el.surname}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.exclusionTo} onDrop={(e) => handleDrop(e, 'to')} onDragOver={handleDragOver}>
          <div className={styles.blockTitle}>
            Will not give gifts to
          </div>
          <div className={styles.blockContent}>
            {selectedPerson?.willNotGiveTo.map(el => (
              <div key={el.id} className={styles.excludedItem}>
                <IconButton  onClick={() => removeElement(el, 'to')}><DeleteIcon/></IconButton>
                <span className={styles.name}>{el.name}</span> <span className={styles.surname}>{el.surname}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.block}>
        <h3>People To Exclude</h3>
        <div className={styles.list}>
          {filteredActivePeopleList.map((person) => (
            <div key={person.id}
                 draggable
                 onClick={(e) => handleItemClick(person, e)}
                 onDragStart={() => handleDragStart(person)}
                 className={`${styles.draggable} 
                  ${selectedItems.includes(person) ? `${styles.selected}` : ""}
                  ${selectedPerson?.willNotReceiveFrom.includes(person) ? `${styles.willNotReceiveFrom}` : ""}
                  ${selectedPerson?.noRelationTo.includes(person) ? `${styles.noRelationTo}` : ""}
                  ${selectedPerson?.willNotGiveTo.includes(person) ? `${styles.willNotGiveTo}` : ""}
                 `}>
              <span className={styles.name}>{person.name}</span> <span className={styles.surname}>{person.surname}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ExclusionManagement;
