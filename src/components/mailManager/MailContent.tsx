import styles from './MailContent.module.css'
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import {ErrorMessage, MailTemplate, MailType, SnackbarState} from "../../model";
import React, {useEffect, useState} from "react";
import {Button, TextField, ToggleButton, ToggleButtonGroup} from "@mui/material";
import {post} from "../../Utils";

function MailContentDisplay({mailTemplate, onEdit}: {mailTemplate: MailTemplate, onEdit: () => void}) {
  function downloadMail() {
    if (!mailTemplate.template) {
      return;
    }

    const fileType = mailTemplate.typeMail === 'eml' ? 'eml' : mailTemplate.typeMail === 'html' ? 'html' : 'txt';
    const element = document.createElement("a");
    const file = new Blob([mailTemplate.template], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${mailTemplate.name}.${fileType}`;
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  return (
    <div className={styles.mailDisplay}>
      <div className={styles.mailTitleBlock}>
        <div className={styles.mailInfo}>
          <ToggleButtonGroup color="primary" value={mailTemplate.typeMail} exclusive disabled={true}>
            <ToggleButton value="text" title='Pure text format'>Text</ToggleButton>
            <ToggleButton value="html" title='HTML format'>Html</ToggleButton>
            <ToggleButton value="eml" title='Gmail saved as file'>Eml</ToggleButton>
          </ToggleButtonGroup>
          <div><span className={styles.key}>Name:</span> <span className={styles.value}>{mailTemplate.name}</span></div>
          {!mailTemplate.isDefault && <Button onClick={onEdit} variant='outlined' startIcon={<EditIcon/>}>Edit</Button>}
          <Button className={styles.mailDownload} onClick={downloadMail} variant='outlined' startIcon={<DownloadIcon/>}>Download</Button>
        </div>
        <div className={styles.mailTitle}><span className={styles.key}>Subject:</span> <span className={styles.value}>{mailTemplate.title}</span></div>
      </div>
      {mailTemplate?.typeMail === 'text' ? <div>
        <pre className={styles.mailContent}>{mailTemplate.template}</pre>
      </div> : mailTemplate.typeMail === 'html' ? <div>
        <div dangerouslySetInnerHTML={{__html: mailTemplate.template || ''}} className={styles.mailContent}/>
      </div> : mailTemplate.typeMail === 'eml' ? <div>
        <div dangerouslySetInnerHTML={{__html: mailTemplate.emlFormattedContent || ''}}
             className={styles.mailContent}/>
      </div> : ''}
    </div>
  );
}

function MailContentEdit({mailTemplate, onSave, onCancel, onErrorDialog, onSnackbar, onSetTempMail} :
                         {mailTemplate: MailTemplate, onSave: (mt: MailTemplate) => void, onCancel: () => void,
                           onErrorDialog: (err: ErrorMessage) => void,
                           onSnackbar: (msg: string, state: SnackbarState) => void,
                           onSetTempMail: (m: MailTemplate) => void,
                         }) {

  const [mailTitle, setMailTitleStr] = useState<string>('');
  const [mailContent, setMailContentStr] = useState<string>('');
  const [mailType, setMailTypeStr] = useState<MailType>('html');
  const [mailName, setMailNameStr] = useState<string>('');
  const [mailFormattedContent, setMailFormattedContentStr] = useState<string>('');
  const [isDragging, setDragging] = useState<boolean>(false);

  function updateTempMail() {
    onSetTempMail(toMailTemplate());
  }

  function setMailTitle(str: string): void {
    setMailTitleStr(str);
    updateTempMail();
  }

  function setMailContent(str: string): void {
    setMailContentStr(str);
    updateTempMail();
  }

  function setMailType(mailType: MailType): void {
    setMailTypeStr(mailType);
    updateTempMail();
  }

  function setMailName(str: string): void {
    setMailNameStr(str);
    updateTempMail();
  }

  function setMailFormattedContent(str: string): void {
    setMailFormattedContentStr(str);
    updateTempMail();
  }


  useEffect(() => {
    init(mailTemplate);
  }, [mailTemplate]);

  function init(mailTemplate: MailTemplate) {
    if (!mailTemplate) {
      setMailTitle('');
      setMailContent('');
      setMailFormattedContent('');
      setMailType('html');
      setMailName('');
    } else {
      setMailTitle(mailTemplate.title || '');
      setMailContent(mailTemplate.template || '');
      setMailFormattedContent(mailTemplate.emlFormattedContent || '');
      setMailType(mailTemplate.typeMail || 'html');
      setMailName(mailTemplate.name || '');
    }
  }

  function saveTemplate() {
    if (!isValid()) {
      return;
    }
    onSave(toMailTemplate());
  }

  function toMailTemplate(): MailTemplate {
    return {
      id: mailTemplate.id,
      name: mailName,
      title: mailTitle,
      template: mailContent,
      typeMail: mailType,
      emlFormattedContent: mailFormattedContent,
      isDefault: false,
    };
  }

  function cancel() {
    init(mailTemplate);
    onCancel();
  }

  function isValid() {
    return mailName && mailTitle && mailType && mailContent;
  }

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
      setMailContent(e.target.result); // File content as string
      handleUpload(e.target.result).then(() => {});
    };
    reader.onerror = (e: any) => {
      onErrorDialog({message: 'Error handling the mail preview', err: e});
    }
    reader.readAsText(file); // Read the file as text
  };


  const handleFileDrop = (event: any) => {
    event.preventDefault();
    setDragging(false);
    const droppedFile = event.dataTransfer.files[0];
    readFile(droppedFile);
  };

  const handleUpload = async (mailContent: string) => {
    try {
      const mailTemplate: MailTemplate = {typeMail: 'eml', template: mailContent};
      const res: MailTemplate = await post(`/email/template/preview`, mailTemplate);
      setMailFormattedContent(res.emlFormattedContent || '');
      setMailContent(mailContent)
      onSnackbar('Mail preview displayed', 'info');
    } catch (err) {
      onErrorDialog({message: 'Could not prepare the mail preview', err})
    }
  };

  const handleDragOver = (event: any) => {
    event.preventDefault(); // Prevent default behavior to allow dropping
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false); // Reset the state when the file leaves the drop zone
  };

  return (
    <div className={styles.mailDisplay}>
      <div className={styles.mailTitleBlock}>
        <div className={`${styles.mailInfo} ${styles.flexSpaceBetween}`}>
          <div className={styles.mailInfo}>
            <ToggleButtonGroup color="primary" value={mailType} exclusive onChange={(_, newValue) => setMailType(newValue)}>
              <ToggleButton value="text" title='Pure text format'>Text</ToggleButton>
              <ToggleButton value="html" title='HTML format'>Html</ToggleButton>
              <ToggleButton value="eml" title='Gmail saved as file'>Eml</ToggleButton>
            </ToggleButtonGroup>
            <div className={`${styles.editField}`}><span className={styles.key}>Name:</span> <TextField value={mailName} onChange={e => setMailName(e.target.value)}></TextField></div>
            <Button onClick={saveTemplate} disabled={!isValid()} variant='contained'>Save</Button>
          </div>
          <Button onClick={cancel} variant='outlined'>Cancel</Button>
        </div>
        <div className={`${styles.mailTitle} ${styles.editField}`}><span className={styles.key}>Subject:</span>  <TextField className={styles.editSubject} value={mailTitle} onChange={e => setMailTitle(e.target.value)}></TextField></div>
      </div>
      {mailType === 'text' ? <div>
        <textarea className={`${styles.mailContent} ${styles.editMailContent}`} value={mailContent} onChange={e => setMailContent(e.target.value)}></textarea>
      </div> : mailType === 'html' ? <div>
        <textarea className={`${styles.mailContent} ${styles.editMailContent}`} value={mailContent} onChange={e => setMailContent(e.target.value)}></textarea>
      </div> : mailType === 'eml' ? <div>
        <div className={`${styles.mailContent} ${styles.dragAndDrop} ${styles.emptyEmail} ${isDragging ? styles.dragging : ""}`}
             onDrop={handleFileDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
          <input type="file" onChange={handleFileChange} style={{display: "none"}} id="fileInput"/>
          <label htmlFor="fileInput" style={{cursor: "pointer"}}>
            <div className={styles.browseButton}>Upload a .eml file (email saved from gmail)</div>
          </label>
        </div>
        {mailFormattedContent && <div dangerouslySetInnerHTML={{__html: mailFormattedContent || ''}}
                                      className={`${styles.mailContent}`}>
        </div>}
      </div> : ''}
    </div>
  );
}

function MailContent({mailTemplate, onSave, onErrorDialog, onSnackbar, onSetTempMail}: {
  mailTemplate?: MailTemplate,
  onSave: (mailTemplate: MailTemplate) => void,
  onErrorDialog: (err: ErrorMessage) => void,
  onSnackbar: (msg: string, state: SnackbarState) => void,
  onSetTempMail: (tempMail: MailTemplate) => void,
}) {
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    setEditMode(!mailTemplate?.isDefault && mailTemplate?.id === undefined);
    onSetTempMail(mailTemplate as MailTemplate);
  }, [mailTemplate]);

  function saveTemplate(mt: MailTemplate) {
    onSave(mt);
    setEditMode(false);
  }

  return (
    <>
      {!mailTemplate ? ''
        : editMode ? <MailContentEdit mailTemplate={mailTemplate} onSave={saveTemplate}
                                      onCancel={() => setEditMode(false)} onSnackbar={onSnackbar} onErrorDialog={onErrorDialog} onSetTempMail={onSetTempMail}></MailContentEdit>
          : <MailContentDisplay mailTemplate={mailTemplate} onEdit={() => setEditMode(true)}></MailContentDisplay>}
    </>
  );
}

export default MailContent;