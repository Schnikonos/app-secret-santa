import styles from './ImportFromFile.module.css'
import {Button, Dialog, DialogTitle} from "@mui/material";
import {ErrorMessage, ImportPersonReply, Person, PersonGroup, SnackbarState} from "../../model";
import {post} from "../../Utils";
import React, {useEffect, useState} from "react";

function ImportFromFile({open, onClose, onSnackbar, onErrorDialog}:
                        {open: boolean, onClose: (persons?: Person[], res?: ImportPersonReply) => void,
                          onErrorDialog: (err: ErrorMessage) => void,
                          onSnackbar: (msg: string, state: SnackbarState) => void,
                        }) {
  const [isDragging, setDragging] = useState<boolean>(false);
  const [peopleList, setPeopleList] = useState<Person[]>([])

  useEffect(() => {
    setPeopleList([]);
  }, [open]);

  const handleFileChange = (event: any) => {
    const selectedFile = event.target.files[0];
    readFile(selectedFile);
  };

  const readFile = (file: any) => {
    if (!file) {
      return;
    }

    // Read the file content as text
    const reader = new FileReader();
    reader.onload = (e: any) => {
      handleNewContent(e.target.result); // File content as string
    };
    reader.onerror = (e: any) => {
      onErrorDialog({message: 'Error handling the mail preview', err: e});
    }
    reader.readAsText(file); // Read the file as text
  };

  const handleNewContent = (contentStr: string) => {
    const content: Person[] = contentStr.split('\n').map((line, index) => {
      let list = line.split(',');
      const [name = '', surname = '', email = '', groupsStr = ''] = list.map(e => e.trim());
      const groups: PersonGroup[] = groupsStr.split(';').filter(g => g.trim() !== '').map(e => ({name: e.trim()}));
      return {id: index, name: name.trim(), surname: surname.trim(), email: email.trim(), groups, willNotGiveTo: [], willNotReceiveFrom: [], noRelationTo: []};
    });
    setPeopleList(content);
  };


  const handleFileDrop = (event: any) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    readFile(droppedFile);
  };

  const handleDragOver = (event: any) => {
    event.preventDefault(); // Prevent default behavior to allow dropping
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false); // Reset the state when the file leaves the drop zone
  };

  const onSave = async () => {
    try {
      const res: ImportPersonReply = await post('/person/import-people', peopleList);
      onClose(peopleList, res);
      onSnackbar(`Successfully imported the persons [${res.newPersons.length} person added]`, 'success');
    } catch (err) {
      onErrorDialog({message: 'Error while importing persons', err});
    }
  };

  const personTitle = (person: Person) => {
    return `${person.name} - ${person.surname} - ${person.email}`;
  }

  return (
    <Dialog onClose={() => onClose()} open={open} maxWidth="lg">
      <DialogTitle className={styles.title}>Import People from CSV file</DialogTitle>
      <div className={styles.content}>
        <div className={styles.importContent}>
          <div className={styles.description}>
            <div className={styles.label}>Format</div>
            <div className={styles.value}>
              <span title='[Mandatory] Family name of the person'>Name*</span>,<span
              title='[Mandatory] Surname of the person'>Surname*</span>,<span
              title='[Mandatory] Email to contact the person'>Email*</span>,<span
              title="[Optional] Groups to which the person belongs (separated by ';')">Groups</span>
            </div>
          </div>
          <div
            className={`${styles.importFile} ${isDragging ? styles.dragging : ""}`}
            onDrop={handleFileDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
            <input type="file" onChange={handleFileChange} style={{display: "none"}} id="fileInput"/>
            <label htmlFor="fileInput" style={{cursor: "pointer"}}>
              <div className={styles.importFileButton}>Upload a csv file</div>
            </label>
          </div>
        </div>
        <div>
          <div className={styles.personListTitle}>List of person to import</div>
          <div className={styles.personListContent}>
            {peopleList.map(person => (
              <div key={person.id} className={styles.personInfo} title={personTitle(person)}>
                <span className={styles.name}>{person.name}</span>
                <span className={styles.surname}>{person.surname}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.actions}>
        <Button onClick={() => onClose()} variant='outlined'>Cancel</Button>
        <Button onClick={onSave} variant='contained'>Save</Button>
      </div>
    </Dialog>
  );
}

export default ImportFromFile;