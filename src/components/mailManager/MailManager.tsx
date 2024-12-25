import styles from './MailManager.module.css'
import {AppBar, Button, IconButton, Toolbar, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {ErrorMessage, MailTemplate, SnackbarState} from "../../model";
import {deleteCall, get, post} from "../../Utils";
import MailContent from "./MailContent";
import DeleteIcon from "@mui/icons-material/Delete";

function MailManager({onBack, onConfirmModal, onErrorDialog, onSnackbar}:
                     {onBack: () => void, onConfirmModal: (msg: string, cbk: () => void) => void
                       onErrorDialog: (err: ErrorMessage) => void,
                       onSnackbar: (msg: string, state: SnackbarState) => void,
                     }) {
  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<MailTemplate>();
  const [defaultTemplate, setDefaultTemplate] = useState<MailTemplate>();

  useEffect(() => {
    get(`http://localhost:8080/email/template`).then(res => setTemplates(res)).catch(err => onErrorDialog({message: `Failed to get template`, err}));
    get('http://localhost:8080/email/template/default').then((res: MailTemplate) => {
      res.isDefault = true;
      setDefaultTemplate(res);
    }).catch(err => onErrorDialog({message: `Failed to get default template`, err}));
  }, []);

  async function displayTemplate(template?: MailTemplate) {
    if (!template) {
      return;
    }
    if (!template.template) {
      const fullTemplate = await get(`http://localhost:8080/email/template/${template.id}`);
      template.template = fullTemplate.template;
      template.emlFormattedContent = fullTemplate.emlFormattedContent;
    }
    setCurrentTemplate(template);
  }

  function toClipBoard(text: string) {
    navigator.clipboard.writeText('{{' + text + '}}');
  }

  async function saveTemplate(template: MailTemplate) {
    try {
      const newTemplate = await post(`http://localhost:8080/email/template`, template);
      setCurrentTemplate(newTemplate);
      onSnackbar('Mail template saved', 'success');

      await refreshTemplates();
    } catch (err) {
      console.log(err);
      onErrorDialog({message: 'Error while saving the template', err});
    }
  }

  async function refreshTemplates() {
    try {
      const newTemplateList = await get('http://localhost:8080/email/template');
      setTemplates(newTemplateList);
    } catch (err) {
      console.log(err);
      onErrorDialog({message: 'Error while refreshing the templates list', err});
    }
  }

  async function deleteTemplate(template: MailTemplate) {
    if (currentTemplate?.id === template.id) {
      setCurrentTemplate(undefined);
    }
    await deleteCall(`http://localhost:8080/email/template/${template.id}`);
    await refreshTemplates();
  }

  function addTemplate() {
    setCurrentTemplate({typeMail: 'html'});
  }

  function confirmDelete(event: any, template: MailTemplate) {
    event.stopPropagation();
    onConfirmModal(`Are you sure you want to delete the template ${template.name} [${template.typeMail}] ?`, () => deleteTemplate(template));
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button className={styles.backButton} color="inherit" onClick={onBack}>Back</Button>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Mail Templates
          </Typography>
        </Toolbar>
      </AppBar>
      <div className={styles.content}>
        <div className={styles.templateList}>
          <h3 className={styles.listTitle}>Mail Templates</h3>
          <div className={styles.templateListContent}>
            <div className={styles.addTemplateButton}><Button onClick={addTemplate} variant='outlined'>Add Template</Button></div>
            <div className={styles.templateListItems}>
              <div className={`${currentTemplate?.isDefault && styles.selected} ${styles.itemDefault} ${styles.item}`}
                   title='If no mailTemplate is associated to the Secret Santa, this one will be used to send mails'
                   onClick={() => displayTemplate(defaultTemplate)}>
                DEFAULT
              </div>
              {templates.map((template) => (
                <div className={`${currentTemplate?.id === template.id && styles.selected} ${styles.item}`}
                     key={template.id} onClick={() => displayTemplate(template)}>
                  <IconButton onClick={(e) => confirmDelete(e, template)}><DeleteIcon/></IconButton>
                  <span title={`${template.name} [${template.typeMail}]`} className={styles.templateName}>{template.name}</span>
                </div>))}
            </div>
          </div>
        </div>
        <div>
          <MailContent mailTemplate={currentTemplate} onSave={saveTemplate} onSnackbar={onSnackbar} onErrorDialog={onErrorDialog}/>
        </div>
        <div>
          <h3 title='The elements below can be used to replace some parts of the messages'>Placeholders</h3>
          <div className={styles.propertyList}>
            <div title='Name of your Secret Santa' onClick={() => toClipBoard('secretSantaName')}>&#123;&#123;secretSantaName&#125;&#125;</div>
            <div title='Date of your Secret Santa' onClick={() => toClipBoard('secretSantaDate')}>&#123;&#123;secretSantaDate&#125;&#125;</div>
            <div title='Name of the gift giver (the one receiving the mail)' onClick={() => toClipBoard('fromName')}>&#123;&#123;fromName&#125;&#125;</div>
            <div title='Surname of the gift giver (the one recieving the mail)' onClick={() => toClipBoard('fromSurname')}>&#123;&#123;fromSurname&#125;&#125;</div>
            <div title='Name of the gift receiver' onClick={() => toClipBoard('toName')}>&#123;&#123;toName&#125;&#125;</div>
            <div title='Surame of the gift receiver' onClick={() => toClipBoard('toSurname')}>&#123;&#123;toSurname&#125;&#125;</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MailManager;