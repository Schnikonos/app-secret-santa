import styles from './Overview.module.css';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SendIcon from '@mui/icons-material/Send';
import {AppBar, Button, Dialog, DialogTitle, TextField, Toolbar, Typography} from "@mui/material";
import {ComputeReply, MailReply, Person, Santa, SantaRun, SantaRunPeople} from "../../model";
import Link from "./Link";
import {useEffect, useState} from "react";
import {get, post} from "../../Utils";
import RightPanel from "./RightPanel";
import AddPerson from "./AddPerson";
import {TokenResponse, useGoogleLogin} from "@react-oauth/google";

function NewSantaDialog({open, santaInput, handleClose}: {open: boolean, santaInput?: Santa, handleClose: (id: number | null | undefined) => void}) {
    const [santaName, setSantaName] = useState<string>('')
    const [santaDate, setSantaDate] = useState<string>('')

    useEffect(() => {
        setSantaName(santaInput?.name || '');
        setSantaDate(santaInput?.secretSantaDate || '');
    }, [santaInput]);

    async function save() {
        try {
            const santa: Santa = await post(`http://localhost:8080/person/santa`, {id: santaInput?.id, name: santaName, secretSantaDate: santaDate});
            if (santaInput) {
                santaInput.name = santaName;
                santaInput.secretSantaDate = santaDate;
            }
            handleClose(santa.id);
        } catch (error) {
            handleClose(null);
        }
    }

    return (
      <Dialog onClose={() => handleClose(null)} open={open}>
          <DialogTitle>Set backup account</DialogTitle>
          <TextField id="name" label="Name" value={santaName} onChange={e => setSantaName(e.target.value)}/>
          <TextField id="date" label="Date" value={santaDate} onChange={e => setSantaDate(e.target.value)}/>
          <Button onClick={() => save()}>Save</Button>
      </Dialog>
    );
}

function Overview({peopleList, selectedSanta, selectedRun, onSelectSanta, onSelectRun, onManage}:
                    {
                        peopleList: Person[], selectedSanta?: Santa, selectedRun: SantaRun,
                        onSelectSanta: (santa?: Santa) => void,
                        onSelectRun: (run?: SantaRun) => void,
                        onManage: (santa: Santa, santaRun?: SantaRun) => void}
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

    const [mailsToSend, setMailsToSend] = useState<SantaRunPeople[]>([]);
    const [santaToUpdate, setSantaToUpdate] = useState<Santa>();

    function handleOnLoginError(err: Pick<TokenResponse, "error" | "error_description" | "error_uri">) {
        console.log(err);
    }

    async function handleOnLoginSuccess(resp: Omit<TokenResponse, "error" | "error_description" | "error_uri">) {
        await post('http://localhost:8080/email/token', {token: resp.access_token});
        executeSendMails(mailsToSend);
    }

    async function executeSendMails(mails: SantaRunPeople[]) {
        const query: SantaRun = {id: selectedRun.id, peopleList: mails};
        const reply: MailReply = await post(`http://localhost:8080/email/mail/${selectedSanta?.id}`, query);
    }

    async function updateSanta(newSanta?: Santa) {
        onSelectSanta(newSanta);
        if (!newSanta) {
            setSantaRunList([]);
            onSelectRun({peopleList: []});
            setComputed(false);
            return;
        }
        const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/person/santa/${newSanta.id}/run`);
        setSantaRunList(newSantaRunList);
        if (newSantaRunList.length === 0) {
            onSelectRun({peopleList: []});
            setComputed(false);
            return;
        }
        const lastRun: SantaRun | undefined = await get(`http://localhost:8080/person/santa/${newSanta.id}/run/${newSantaRunList[0].id}`);
        onSelectRun(lastRun);
        setComputed(!!lastRun && lastRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
    }

    useEffect(() => {
        get('http://localhost:8080/person/santa').then(res => setSantaList(res));
        if (!selectedSanta && !selectedRun) {
            get('http://localhost:8080/person/last-santa').then(res => updateSanta(res));
        } else if (selectedSanta) {
            get(`http://localhost:8080/person/santa/${selectedSanta.id}/run`).then(res => setSantaRunList(res));
        }
        setComputed(!!selectedRun && selectedRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
        updateRunPersonList(selectedRun?.peopleList || []);
    }, [selectedRun]);

    async function refresh() {
        const newSantaList: Santa[] = await get('http://localhost:8080/person/santa');
        setSantaList(newSantaList);

        if (selectedSanta) {
            const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/person/santa/${selectedSanta.id}/run`);
            setSantaRunList(newSantaRunList);
        }
    }

    async function newSanta(id: number | null | undefined) {
        setOpenDgNewSanta(false);
        if (id === null) {
            return;
        }
        get('http://localhost:8080/person/santa').then(res => setSantaList(res));
        const newSanta: Santa = await get(`http://localhost:8080/person/santa/${id}`);
        await updateSanta(newSanta);
    }

    function selectSanta(selectedSanta?: Santa) {
        updateSanta(selectedSanta);
    }

    async function selectRun(selectedSantaRun?: SantaRun) {
        if (!selectedSantaRun) {
            onSelectRun(undefined);
            return;
        }
        const newSantaRun: SantaRun = await get(`http://localhost:8080/person/santa/${selectedSanta?.id}/run/${selectedSantaRun.id}`);
        onSelectRun(newSantaRun);
        setComputed(!!newSantaRun && newSantaRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
    }

    async function compute() {
        selectedRun.peopleList = runPersonList.filter(p => !p.isRemoved);
        const result: ComputeReply = await post(`http://localhost:8080/person/compute/${selectedSanta?.id}`, selectedRun);
        if (result.ok) {
            onSelectRun(result.santaRun);
            const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/person/santa/${selectedSanta?.id}/run`);
            setSantaRunList(newSantaRunList);
            setComputed(true);
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
        const res = await get('http://localhost:8080/email/token');
        if (!!res) {
            await executeSendMails(runPeoples);
        } else {
            setMailsToSend(runPeoples)
            login();
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
                    Secret Santa
                    {selectedSanta ? ` - ${selectedSanta.name} [${selectedSanta.creationDate}]` : ''}
                    {selectedRun ? ` - ${runPersonList.length} people` : ''}
                </Typography>
                <Button disabled={!selectedSanta} color="inherit" onClick={() => selectedSanta ? onManage(selectedSanta, selectedRun) : null}>Manage</Button>
                <Button color="inherit" onClick={newSantaDialog}>New</Button>
            </Toolbar>
        </AppBar>

        <div className={styles.mainPanel}>
            <div className={styles.subPanel}>
                <div className={styles.listNames}>
                    <div className={styles.addPerson}>
                        <AddPerson peopleList={peopleList} addPerson={addPerson} notInList={runPersonList.map(p => p.idPeople)}></AddPerson>
                    </div>
                    {runPersonList ? <div>
                        {runPersonList.map((person: SantaRunPeople) =>
                          <div key={person.idPeople}>
                              <Link santaRunPeopleList={runPersonList} person={person} peopleList={peopleList} removeFromTo={removeFromTo} addPersonFromTo={addPersonFromTo} addPeopleList={currentPersonList} sendSingleMail={sendSingleMail}></Link>
                          </div>
                        )}
                    </div> : ''}
                </div>
                <div className={styles.actionBar}>
                    <Button onClick={compute} startIcon={<AutoFixHighIcon/>} variant='outlined'>Compute</Button>
                    <Button onClick={reshuffle} disabled={!computed} startIcon={<ShuffleIcon/>} variant="outlined">Reshuffle</Button>
                    <Button onClick={sendAllMails} disabled={!computed} startIcon={<SendIcon/>} variant="contained">Send Mail</Button>
                </div>
            </div>
            <div className={styles.rightPanel}>
                <RightPanel santaList={santaList ? santaList : []} santa={selectedSanta} santaRunList={santaRunList} onUpdateSanta={updateSantaItem}
                            santaRun={selectedRun} onSelectSanta={selectSanta} onSelectRun={selectRun} onRefresh={refresh}></RightPanel>
            </div>
        </div>

        <NewSantaDialog open={openDgNewSanta} santaInput={santaToUpdate} handleClose={(id) => newSanta(id)}></NewSantaDialog>
    </>
}

export default Overview;
