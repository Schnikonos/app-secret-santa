import styles from "./RightPanel.module.css";
import DeleteIcon from '@mui/icons-material/Delete';
import {ErrorMessage, Santa, SantaRun, SnackbarState} from "../../model";
import {deleteCall, formatDate} from "../../Utils";
import {IconButton} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import React from "react";

function ListItem({name, creationDate, lastUpdate, onDelete, onUpdate}: {name: string, creationDate?: string, lastUpdate?: string, onDelete: () => void, onUpdate?: () => void}) {
  function clickDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    onDelete();
  }

  function clickUpdate(e: React.MouseEvent<HTMLButtonElement>) {
    if (onUpdate) {
      e.stopPropagation();
      onUpdate();
    }
  }

  return (
    <div className={styles.itemContent}>
      <div>
        <IconButton onClick={clickDelete}><DeleteIcon/></IconButton>
      </div>
      <div className={styles.itemInfo}>
        <div className={styles.name}>{name}</div>
        <div className={styles.date}>{formatDate(creationDate)}</div>
      </div>
      <div>
        {onUpdate && (<IconButton onClick={clickUpdate}><EditIcon/></IconButton>)}
      </div>
    </div>
  );
}

function RightPanel({santaList, santa, santaRunList, santaRun, onSelectSanta, onSelectRun, onRefresh, onUpdateSanta, onConfirmModal, onErrorDialog, onSnackbar}:
                      {
                        santaList: Santa[], santa?: Santa, santaRunList: SantaRun[], santaRun?: SantaRun,
                        onConfirmModal: (msg: string, cbk: () => void) => void,
                        onSelectSanta: (santa?: Santa) => void, onSelectRun: (santaRun?: SantaRun) => void, onRefresh: () => void, onUpdateSanta: (santa?: Santa) => void,
                        onErrorDialog: (err: ErrorMessage) => void,
                        onSnackbar: (msg: string, state: SnackbarState) => void,
                      }) {
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

  function confirmDeleteSanta(santa: Santa) {
    onConfirmModal(`Are you sure you want to delete the Secret Santa [${santa?.name}] [${santa?.secretSantaDate}]`, () => deleteSanta(santa));
  }

  async function deleteSanta(selectedSanta: Santa) {
    try {
      await deleteCall(`/person/santa/${selectedSanta.id}`);
      onSnackbar('Secret Santa successfully deleted', 'success');
      if (selectedSanta.id === santa?.id) {
        onSelectSanta(undefined);
      }
      onRefresh();
    } catch (err) {
      onErrorDialog({message: 'Issue while deleting the Secret Santa', err});
    }
  }

  async function deleteRun(selectedSantaRun: SantaRun) {
    try {
      await deleteCall(`/person/santa/${santa?.id}/run/${selectedSantaRun.id}`);
      onSnackbar('Run successfully deleted', 'success');
      if (selectedSantaRun.id === santaRun?.id) {
        onSelectRun(undefined);
      }
      onRefresh();
    } catch (err) {
      onErrorDialog({message: 'Issue while deleting the Run', err});
    }
  }

  return (
    <div className={styles.panel}>
      <div className={styles.subPanel}>
        <div className={styles.title}>SecretSantas</div>
        <div className={styles.list}>
          {santaList.map(value =>
            <div key={value.id} className={`${styles.item} ${value.id === santa?.id && styles.selected}`} onClick={() => selectSanta(value)} title={`[${value.secretSantaDate}] - ${value.name}`}>
              <ListItem name={value.name} creationDate={value.creationDate} lastUpdate={value.lastUpdate} onDelete={() => confirmDeleteSanta(value)} onUpdate={() => onUpdateSanta(value)}></ListItem>
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
