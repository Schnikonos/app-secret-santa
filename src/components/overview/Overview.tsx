import styles from './Overview.module.css';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SendIcon from '@mui/icons-material/Send';
import {AppBar, Button, Dialog, DialogTitle, Menu, MenuItem, TextField, Toolbar, Typography} from "@mui/material";
import {
    AppInfo,
    ComputeReply,
    ErrorMessage,
    MailReply,
    MailTemplate,
    Person,
    PersonGroup,
    Santa,
    SantaRun,
    SantaRunPeople,
    SnackbarState
} from "../../model";
import Link from "./Link";
import React, {useEffect, useState} from "react";
import {get, post} from "../../Utils";
import RightPanel from "./RightPanel";
import AddPerson from "./AddPerson";
import {TokenResponse, useGoogleLogin} from "@react-oauth/google";
import GroupFilter from "../common/GroupFilter";

function NewSantaDialog({open, santaInput, handleClose, onErrorDialog, onSnackbar}:
                        {open: boolean, santaInput?: Santa, handleClose: (id: number | null | undefined) => void,
                            onErrorDialog: (err: ErrorMessage) => void,
                            onSnackbar: (msg: string, state: SnackbarState) => void,
                        }) {
    const [santaName, setSantaName] = useState<string>('')
    const [santaDate, setSantaDate] = useState<string>('')
    const [santaTemplate, setSantaTemplate] = useState<MailTemplate>()
    const [templates, setTemplates] = useState<MailTemplate[]>([]);

    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const openMailTemplate = Boolean(anchorEl);

    useEffect(() => {
        get(`/email/template`).then(res => setTemplates(res)).catch(err => onErrorDialog({message: 'Error getting the mail templates', err}));
        setSantaName(santaInput?.name || '');
        setSantaDate(santaInput?.secretSantaDate || '');
        setSantaTemplate(santaInput?.mailTemplate);
    }, [santaInput]);

    async function save() {
        try {
            const santa: Santa = await post(`/person/santa`, {id: santaInput?.id, name: santaName, secretSantaDate: santaDate, mailTemplate: santaTemplate});
            onSnackbar('Successfully saved the Secret Santa !', 'success');
            if (santaInput) {
                santaInput.name = santaName;
                santaInput.secretSantaDate = santaDate;
                santaInput.mailTemplate = santaTemplate;
            }
            handleClose(santa.id);
        } catch (error) {
            handleClose(null);
            onErrorDialog({message: 'Issue while saving the secret santa', err: error});
        }
    }

    const handleCloseMailTemplateMenu = (mailTemplate?: MailTemplate) => {
        setAnchorEl(null);
        setSantaTemplate(mailTemplate);
    };

    const handleOpenMailTemplateMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };

    return (
      <Dialog onClose={() => handleClose(null)} open={open}>
          <DialogTitle>Edit your Secret Santa</DialogTitle>
          <div className={styles.newSantaFields}>
              <TextField id="name" label="Name" value={santaName} onChange={e => setSantaName(e.target.value)}/>
              <TextField id="date" label="Date" value={santaDate} onChange={e => setSantaDate(e.target.value)}/>
          </div>
          {templates && templates.length > 0 && (
            <div className={styles.mailTemplates}>
                <Button onClick={handleOpenMailTemplateMenu}><span className={styles.italic}>Mail Template:</span> <span className={styles.bold}>{santaTemplate ? santaTemplate.name : 'DEFAULT'}</span></Button>
                <Menu anchorEl={anchorEl} open={openMailTemplate} onClose={() => handleCloseMailTemplateMenu(santaTemplate)}>
                    <MenuItem onClick={() => handleCloseMailTemplateMenu(undefined)}>DEFAULT</MenuItem>
                    {templates.map(template => (
                      <MenuItem key={template.id} onClick={() => handleCloseMailTemplateMenu(template)}>{template.name} [{template.typeMail}]</MenuItem>
                    ))}
                </Menu>
            </div>
          )}
          <Button onClick={() => save()} disabled={!santaName || !santaDate}>Save</Button>
      </Dialog>
    );
}

function Overview({peopleList, selectedSanta, selectedRun, onSelectSanta, onSelectRun, onManage, filters, onSetFilters, availableFilters, onManageMail, onConfirmModal, onErrorDialog, onSnackbar}:
                    {
                        peopleList: Person[], selectedSanta?: Santa, selectedRun: SantaRun,
                        onSelectSanta: (santa?: Santa) => void,
                        onSelectRun: (run?: SantaRun) => void,
                        onConfirmModal: (msg: string, cbk: () => void) => void,
                        onErrorDialog: (err: ErrorMessage) => void,
                        onSnackbar: (msg: string, state: SnackbarState) => void,
                        onManage: (santa: Santa, santaRun?: SantaRun) => void, onManageMail: () => void,
                        filters: PersonGroup[], onSetFilters: (filters: PersonGroup[]) => void, availableFilters: PersonGroup[]}
) {
    const login = useGoogleLogin({
        scope: 'https://www.googleapis.com/auth/gmail.send',
        flow: 'implicit',
        onSuccess: handleOnLoginSuccess,
        onError: handleOnLoginError,
    });

    const [santaList, setSantaList] = useState<Santa[]>();
    const [computed, setComputed] = useState(false);
    const [santaRunList, setSantaRunList] = useState<SantaRun[]>([]);
    const [openDgNewSanta, setOpenDgNewSanta] = useState(false);
    const [runPersonList, setRunPersonList] = useState<SantaRunPeople[]>([]);
    const [currentPersonList, setCurrentPersonList] = useState<Person[]>([]);

    const [filteredPeopleList, setFilteredPeopleList] = useState<Person[]>([]);

    const [mailsToSend, setMailsToSend] = useState<SantaRunPeople[]>([]);
    const [santaToUpdate, setSantaToUpdate] = useState<Santa>();
    const [appInfo, setAppInfo] = useState<AppInfo>();

    function handleOnLoginError(err: Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
        console.log(err);
        onErrorDialog({message: 'Issue while logging into google', err});
    }

    async function handleOnLoginSuccess(resp: Omit<TokenResponse, "error" | "error_description" | "error_uri">) {
        await post('/email/token', {token: resp.access_token});
        onSnackbar('Successfully logged into google', 'success');
        await executeSendMails(mailsToSend);
    }

    async function executeSendMails(mails: SantaRunPeople[]) {
        const query: SantaRun = {id: selectedRun.id, peopleList: mails};
        try {
            const reply: MailReply = await post(`/email/mail/${selectedSanta?.id}`, query);
            if (reply.success) {
                onSnackbar(`Successfully sent ${reply.nbMailSuccess} mails`, 'success');
            } else {
                onSnackbar(`Issue while sending mails: ${reply.nbMailError} fails / ${reply.nbMailSuccess} success`, 'warning');
            }
            const newRunPeople = runPersonList.map(r => ({...r, mailSent: r.mailSent || reply.idMailsSent.includes(r.idPeople)}));
            setRunPersonList(newRunPeople);
        } catch (error) {
            onErrorDialog({message: 'Issue while sending the mails', err: error});
        }
    }

    async function updateSanta(newSanta?: Santa) {
        try {
            onSelectSanta(newSanta);
            if (!newSanta) {
                setSantaRunList([]);
                onSelectRun({peopleList: []});
                setComputed(false);
                return;
            }
            const newSantaRunList: SantaRun[] = await get(`/person/santa/${newSanta.id}/run`);
            setSantaRunList(newSantaRunList);

            if (newSantaRunList.length === 0) {
                onSelectRun({peopleList: []});
                setComputed(false);
                return;
            }
            const lastRun: SantaRun | undefined = await get(`/person/santa/${newSanta.id}/run/${newSantaRunList[0].id}`);
            onSelectRun(lastRun);
            setComputed(!!lastRun && lastRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
        } catch (err) {
            onErrorDialog({message: 'Issue while refreshing Secret Santa', err});
        }
    }

    useEffect(() => {
        get('/person/santa').then(res => {
            setSantaList(res);
            if (res.length === 0) {
                newSantaDialog();
            }
        }).catch(err => onErrorDialog({message: 'Issue while getting the list of Secret Santa', err}));
        if (!selectedSanta) {
            get('/person/last-santa').then(res => updateSanta(res)).catch(err => onErrorDialog({message: 'Issue while getting the last Secret Santa', err}));
        }
    }, []);

    useEffect(() => {
        if (selectedSanta) {
            get(`/person/santa/${selectedSanta.id}/run`).then(res => setSantaRunList(res)).catch(err => onErrorDialog({message: 'Issue while getting the list of runs', err}));
        }
    }, [selectedSanta]);

    useEffect(() => {
        get('/info').then(res => setAppInfo(res));
        setComputed(!!selectedRun && selectedRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
        updateRunPersonList(selectedRun?.peopleList || []);
    }, [selectedRun]);

    useEffect(() => {
        if (filters.length === 0) {
            setFilteredPeopleList(peopleList);
        } else {
            setFilteredPeopleList(peopleList.filter(p => p.groups.some(g => filters.find(f => f.id === g.id))));
        }
    }, [peopleList, filters]);

    async function refresh() {
        try {
            const newSantaList: Santa[] = await get('/person/santa');
            setSantaList(newSantaList);

            if (selectedSanta) {
                const newSantaRunList: SantaRun[] = await get(`/person/santa/${selectedSanta.id}/run`);
                setSantaRunList(newSantaRunList);
            }
        } catch (err) {
            onErrorDialog({message: 'Issue while refreshing the data', err});
        }
    }

    async function newSanta(id: number | null | undefined) {
        setOpenDgNewSanta(false);
        if (id === null) {
            return;
        }
        try {
            get('/person/santa').then(res => setSantaList(res));
            const newSanta: Santa = await get(`/person/santa/${id}`);
            await updateSanta(newSanta);
        } catch (err) {
            onErrorDialog({message: 'Issue while refreshing the data', err});
        }
    }

    function selectSanta(selectedSanta?: Santa) {
        updateSanta(selectedSanta);
    }

    async function selectRun(selectedSantaRun?: SantaRun) {
        if (!selectedSantaRun) {
            onSelectRun(undefined);
            return;
        }
        try {
            const newSantaRun: SantaRun = await get(`/person/santa/${selectedSanta?.id}/run/${selectedSantaRun.id}`);
            onSelectRun(newSantaRun);
            setComputed(!!newSantaRun && newSantaRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
        } catch (err) {
            onErrorDialog({message: 'Issue while getting the run\'s data', err});
        }
    }

    async function compute() {
        try {
            selectedRun.peopleList = runPersonList.filter(p => !p.isRemoved);
            const result: ComputeReply = await post(`/person/compute/${selectedSanta?.id}`, selectedRun);
            if (result.ok) {
                onSelectRun(result.santaRun);
                const newSantaRunList: SantaRun[] = await get(`/person/santa/${selectedSanta?.id}/run`);
                setSantaRunList(newSantaRunList);
                setComputed(true);
                const msg = `Computation successfull ! ${result.nbChanged > 0 ? `[Changed ${result.nbChanged} From/To]` : ''} ${result.allowSameFromTo ? '!! Warning !! Same FromTo for some' : ''}`;
                const state = result.allowSameFromTo ? 'warning' : 'success';
                onSnackbar(msg, state);
            } else {
                onSnackbar('Could not do the computation', 'warning');
            }
        } catch (err) {
            onErrorDialog({message: 'Issue while doing the computation', err});
        }
    }

    async function reshuffle() {
        runPersonList.forEach(santa => {
            if (santa.isLocked) {
                return;
            }
            santa.idPeopleTo = undefined;
            santa.idPeopleFrom = undefined;
        });
        await compute();
    }

    function sendAllMails() {
        sendMail(runPersonList);
        
    }

    async function sendMail(runPeoples: SantaRunPeople[]) {
        try {
            const res = await get('/email/token');
            if (!!res) {
                await executeSendMails(runPeoples);
            } else {
                setMailsToSend(runPeoples)
                login();
            }
        } catch (err) {
            onErrorDialog({message: 'Issue while sending mails', err});
        }
    }

    function removeFromTo(idFrom: number | undefined, idTo: number | undefined) {
        const updatedData = runPersonList.map(p => {
            if (p.idPeople === idFrom) {
                p.idPeopleTo = undefined;
                p.mailSent = false;
            }
            if (p.idPeople === idTo) {
                p.idPeopleFrom = undefined;
            }
            return p;
        });
        updateRunPersonList(updatedData);
    }

    function addPerson(person: Person) {
        const exclusions = Array.from(new Set([...(person.willNotGiveTo || []).map(p1 => p1.id), ...(person.noRelationTo || []).map(p1 => p1.id)])).map(p1 => ({idPeople: p1}));
        const newPerson = {idPeople: person.id, exclusions, mailSent: false, isRemoved: false};
        updateRunPersonList([newPerson, ...runPersonList]);
    }

    function addPersonFromTo(pFrom?: Person, pTo?: Person) {
        const newPersonList = runPersonList.map(p => {
            if (p.idPeople === pFrom?.id && p.idPeopleTo !== pTo?.id) {
                p.idPeopleTo = pTo?.id;
            }
            if (p.idPeopleFrom !== pFrom?.id && p.idPeople === pTo?.id) {
                p.idPeopleFrom = pFrom?.id;
            }
            if (p.idPeopleFrom === pFrom?.id && p.idPeople !== pTo?.id) {
                p.idPeopleFrom = undefined;
            }
            if (p.idPeople !== pFrom?.id && p.idPeopleTo === pTo?.id) {
                p.idPeopleTo = undefined;
            }
            return p;
        });
        updateRunPersonList(newPersonList);
    }

    function updateRunPersonList(newRunPeopleList: SantaRunPeople[]) {
        const createdMap = new Map();
        peopleList.map(p => createdMap.set(p.id, p));
        setCurrentPersonList(newRunPeopleList.map(s => createdMap.get(s.idPeople)).filter(p => !!p));
        setRunPersonList([...newRunPeopleList]);
    }

    function updateSantaItem(santa?: Santa) {
        setSantaToUpdate(santa);
        setOpenDgNewSanta(true);
    }

    function newSantaDialog() {
        setSantaToUpdate(undefined);
        setOpenDgNewSanta(true);
    }

    function sendSingleMail(person: SantaRunPeople) {
        person.mailSent = false;
        sendMail([person]);
    }

    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    <span className={styles.secretSantaTitle} title={appInfo?.version}>Secret Santa</span>
                    {selectedSanta ? ` - ${selectedSanta.name} [${selectedSanta.secretSantaDate}]` : ''}
                    {selectedRun ? ` - ${runPersonList.length} people` : ''}
                </Typography>
                <Button color="inherit" className={styles.toolbarButton} onClick={onManageMail} title='Manage the mail templates that can be used'>Mail</Button>
                <Button disabled={!selectedSanta} className={styles.toolbarButton} color="inherit" onClick={() => selectedSanta ? onManage(selectedSanta, selectedRun) : null} title='Add/Remove new people and define their blacklists'>People</Button>
                <Button color="inherit" className={styles.toolbarButton} onClick={newSantaDialog} title='Create a new SecretSanta !'>New</Button>
            </Toolbar>
        </AppBar>

        <div className={styles.mainPanel}>
            <div className={styles.subPanel}>
                <div>
                    <GroupFilter filters={filters} onSetFilters={onSetFilters} availableFilters={availableFilters}></GroupFilter>
                </div>
                <div className={styles.listNames}>
                    <div className={styles.addPerson}>
                        <AddPerson peopleList={filteredPeopleList} addPerson={addPerson}
                                   notInList={runPersonList.map(p => p.idPeople)} onEmptyList={() => selectedSanta && onManage(selectedSanta, selectedRun)}></AddPerson>
                    </div>
                    {runPersonList ? <div>
                        {runPersonList.map((person: SantaRunPeople) =>
                          <div key={person.idPeople}>
                              <Link santaRunPeopleList={runPersonList} person={person} peopleList={peopleList}
                                    removeFromTo={removeFromTo} addPersonFromTo={addPersonFromTo}
                                    addPeopleList={currentPersonList} sendSingleMail={sendSingleMail}></Link>
                          </div>
                        )}
                    </div> : ''}
                </div>
                <div className={styles.actionBar}>
                    <Button onClick={compute} startIcon={<AutoFixHighIcon/>} variant='outlined'>Compute</Button>
                    <Button onClick={reshuffle} disabled={!computed} startIcon={<ShuffleIcon/>}
                            variant="outlined">Reshuffle</Button>
                    <Button onClick={sendAllMails} disabled={!computed} startIcon={<SendIcon/>} variant="contained">Send
                        Mail</Button>
                </div>
            </div>
            <div className={styles.rightPanel}>
                <RightPanel santaList={santaList ? santaList : []} santa={selectedSanta} santaRunList={santaRunList} onUpdateSanta={updateSantaItem}
                            santaRun={selectedRun} onSelectSanta={selectSanta} onSelectRun={selectRun} onRefresh={refresh} onConfirmModal={onConfirmModal} onSnackbar={onSnackbar} onErrorDialog={onErrorDialog}></RightPanel>
            </div>
        </div>

        <NewSantaDialog open={openDgNewSanta} santaInput={santaToUpdate} handleClose={(id) => newSanta(id)} onSnackbar={onSnackbar} onErrorDialog={onErrorDialog}></NewSantaDialog>
    </>
}

export default Overview;
