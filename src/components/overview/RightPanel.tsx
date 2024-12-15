import styles from "./RightPanel.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import {Santa, SantaRun} from "../../model";
import {deleteCall, formatDate} from "../../Utils";
import {IconButton} from "@mui/material";

function ListItem({name, creationDate, lastUpdate, onDelete}: {name: string, creationDate?: string, lastUpdate?: string, onDelete: () => void}) {
  function clickDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  }

  return (
    <div className={styles.itemContent}>
      <div>
        <IconButton onClick={clickDelete}><DeleteIcon/></IconButton>
      </div>
      <div>
        <div className={styles.name}>{name}</div>
        <div className={styles.date}>{formatDate(creationDate)}</div>
      </div>
    </div>
  );
}

function RightPanel({santaList, santa, santaRunList, santaRun, onSelectSanta, onSelectRun, onRefresh}:
                      {
                        santaList: Santa[], santa?: Santa, santaRunList: SantaRun[], santaRun?: SantaRun,
                        onSelectSanta: (santa?: Santa) => void, onSelectRun: (santaRun?: SantaRun) => void, onRefresh: () => void}) {
  function selectSanta(selectedSanta: Santa) {
    if (selectedSanta.id !== santa?.id) {
      onSelectSanta(selectedSanta);
    }
  }

  function selectRun(selectedSantaRun: SantaRun) {
    if (selectedSantaRun.id !== santaRun?.id) {
      onSelectRun(selectedSantaRun);
    }
  }

  async function deleteSanta(selectedSanta: Santa) {
    await deleteCall(`http://localhost:8080/person/santa/${selectedSanta.id}`);
    if (selectedSanta.id === santa?.id) {
      onSelectSanta(undefined);
    }
    onRefresh();
  }

  async function deleteRun(selectedSantaRun: SantaRun) {
    await deleteCall(`http://localhost:8080/person/santa/${santa?.id}/run/${selectedSantaRun.id}`);
    if (selectedSantaRun.id === santaRun?.id) {
      onSelectRun(undefined);
    }
    onRefresh();
  }

  return (
    <div className={styles.panel}>
      <div className={styles.subPanel}>
        <div className={styles.title}>SecretSantas</div>
        <div className={styles.list}>
          {santaList.map(value =>
            <div key={value.id} className={`${styles.item} ${value.id === santa?.id ? styles.selected : ''}`} onClick={() => selectSanta(value)}>
              <ListItem name={value.name} creationDate={value.creationDate} lastUpdate={value.lastUpdate} onDelete={() => deleteSanta(value)}></ListItem>
            </div>
          )}
        </div>
      </div>
      <div className={`${styles.subPanel} ${styles.separator}`}>
        <div className={styles.title}>Runs</div>
        <div className={styles.list}>
          {santaRunList.map((value, index) =>
            <div key={value.id} className={`${styles.item} ${value.id === santaRun?.id ? styles.selected : ''}`} onClick={() => selectRun(value)}>
              <ListItem name={`${santaRunList.length - index} [#${value.peopleList.length}]`} creationDate={value.creationDate} lastUpdate={value.lastUpdate} onDelete={() => deleteRun(value)}></ListItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
