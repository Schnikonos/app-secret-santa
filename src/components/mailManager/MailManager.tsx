import styles from './MailManager.module.css'
import {AppBar, Button, IconButton, TextField, Toolbar, Typography} from "@mui/material";
import React, {useEffect, useState} from "react";
import {ErrorMessage, MailTemplate, MailTest, SnackbarState} from "../../model";
import {deleteCall, get, newTab, post} from "../../Utils";
import MailContent from "./MailContent";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import {TokenResponse, useGoogleLogin} from "@react-oauth/google";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

function MailManager({onBack, onConfirmModal, onErrorDialog, onSnackbar}:
                     {onBack: () => void, onConfirmModal: (msg: string, cbk: () => void) => void
                       onErrorDialog: (err: ErrorMessage) => void,
                       onSnackbar: (msg: string, state: SnackbarState) => void,
                     }) {
  const login = useGoogleLogin({
    scope: 'https://www.googleapis.com/auth/gmail.send',
    flow: 'implicit',
    onSuccess: handleOnLoginSuccess,
    onError: handleOnLoginError,
  });

  const [templates, setTemplates] = useState<MailTemplate[]>([]);
  const [tempMail, setTempMail] = useState<MailTemplate>();
  const [currentTemplate, setCurrentTemplate] = useState<MailTemplate>();
  const [defaultTemplate, setDefaultTemplate] = useState<MailTemplate>();

  const [santaName, setSantaName] = useState<string>();
  const [santaDate, setSantaDate] = useState<string>();
  const [fromName, setFromName] = useState<string>();
  const [fromSurname, setFromSurname] = useState<string>();
  const [toName, setToName] = useState<string>();
  const [toSurname, setToSurname] = useState<string>();
  const [toEmail, setToEmail] = useState<string>();

  function handleOnLoginError(err: Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
    console.log(err);
    onErrorDialog({message: 'Issue while logging into google', err});
  }

  useEffect(() => {
    get(`/email/template`).then(res => setTemplates(res)).catch(err => onErrorDialog({message: `Failed to get template`, err}));
    get('/email/template/default').then((res: MailTemplate) => {
      res.isDefault = true;
      setDefaultTemplate(res);
      displayTemplate(res);
    }).catch(err => onErrorDialog({message: `Failed to get default template`, err}));

    setSantaName('My Santa !');
    setSantaDate('2123-12-25');
    setFromName('Potter');
    setFromSurname('Harry');
    setToName('Baggins');
    setToSurname('Frodo');
  }, []);

  async function displayTemplate(template?: MailTemplate) {
    if (!template) {
      return;
    }
    if (!template.template) {
      const fullTemplate = await get(`/email/template/${template.id}`);
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
      const newTemplate = await post(`/email/template`, template);
      setCurrentTemplate(newTemplate);
      onSnackbar('Mail template saved', 'success');

      await refreshTemplates();
    } catch (err) {
      onErrorDialog({message: 'Error while saving the template', err});
    }
  }

  async function refreshTemplates() {
    try {
      const newTemplateList = await get('/email/template');
      setTemplates(newTemplateList);
    } catch (err) {
      onErrorDialog({message: 'Error while refreshing the templates list', err});
    }
  }

  async function deleteTemplate(template: MailTemplate) {
    if (currentTemplate?.id === template.id) {
      setCurrentTemplate(undefined);
    }
    await deleteCall(`/email/template/${template.id}`);
    await refreshTemplates();
  }

  function addTemplate() {
    setCurrentTemplate({typeMail: 'html'});
  }

  function confirmDelete(event: any, template: MailTemplate) {
    event.stopPropagation();
    onConfirmModal(`Are you sure you want to delete the template ${template.name} [${template.typeMail}] ?`, () => deleteTemplate(template));
  }

  function executeSendMails() {
    const query: MailTest = {
      mailVariables: {
        santaName: santaName,
        santaDate: santaDate,
        fromName: fromName,
        fromSurname: fromSurname,
        toName: toName,
        toSurname: toSurname,
        recipientMailAddress: toEmail,
      },
      mailTemplate: tempMail
    };
    post(`/email/mail-test`, query).then(() => onSnackbar('Test mail sent !', 'success')).catch(err => onErrorDialog({message: `Failed to test the mail`, err}));
  }

  async function sendTestMail() {
    try {
      const res = await get('/email/token');
      if (!!res) {
        await executeSendMails();
      } else {
        login();
      }
    } catch (err) {
      onErrorDialog({message: 'Issue while sending mails', err});
    }
  }

  async function handleOnLoginSuccess(resp: Omit<TokenResponse, "error" | "error_description" | "error_uri">) {
    await post('/email/token', {token: resp.access_token});
    onSnackbar('Successfully logged into google', 'success');
    await executeSendMails();
  }

  function isSendTestDisabled() {
    return !(santaName && santaDate && fromName && fromSurname && toName && toSurname && toEmail);
  }

  function sendTestTitle() {
    if (!isSendTestDisabled()) {
      return 'Test your mail !';
    } else {
      return 'You need to fill all fields before sending the template';
    }
  }

  function help() {
    newTab('/help');
  }

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Button className={styles.backButton} color="inherit" onClick={onBack}>Back</Button>
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            Mail Templates
          </Typography>
          <IconButton color="inherit" onClick={help} title='Help'><HelpOutlineIcon/></IconButton>
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
          <MailContent mailTemplate={currentTemplate} onSave={saveTemplate} onSnackbar={onSnackbar} onErrorDialog={onErrorDialog} onSetTempMail={setTempMail}/>
        </div>
        <div>
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
          <div>
            <h3 className={styles.testTitle} title='Test your mail !'>
              <span>Test</span>
              <span title={sendTestTitle()}><IconButton onClick={sendTestMail} disabled={isSendTestDisabled()}><SendIcon/></IconButton></span>
            </h3>
            <div className={styles.testProperties}>
              <TextField id="outlined-basic" label="Mail" variant="outlined" value={toEmail} onChange={e => setToEmail(e.target.value)}/>
              <TextField id="outlined-basic" label="SecretSantaName" variant="outlined" value={santaName} onChange={e => setSantaName(e.target.value)}/>
              <TextField id="outlined-basic" label="SecretSantaDate" variant="outlined" value={santaDate} onChange={e => setSantaDate(e.target.value)}/>
              <TextField id="outlined-basic" label="FromName" variant="outlined" value={fromName} onChange={e => setFromName(e.target.value)}/>
              <TextField id="outlined-basic" label="FromSurname" variant="outlined" value={fromSurname} onChange={e => setFromSurname(e.target.value)}/>
              <TextField id="outlined-basic" label="ToName" variant="outlined" value={toName} onChange={e => setToName(e.target.value)}/>
              <TextField id="outlined-basic" label="ToSurname" variant="outlined" value={toSurname} onChange={e => setToSurname(e.target.value)}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MailManager;