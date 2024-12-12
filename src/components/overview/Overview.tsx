import styles from './Overview.module.css';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SendIcon from '@mui/icons-material/Send';
import {AppBar, Button, Dialog, DialogTitle, TextField, Toolbar, Typography} from "@mui/material";
import {ComputeReply, Person, Santa, SantaRun, SantaRunPeople} from "../../model";
import Link from "./Link";
import {useEffect, useState} from "react";
import {get, post} from "../../Utils";
import RightPanel from "./RightPanel";

function NewSantaDialog({open, handleClose}: {open: boolean, handleClose: (id: number | null | undefined) => void}) {
    const [santaName, setSantaName] = useState<string>()

    async function save() {
        try {
            const santa: Santa = await post(`http://localhost:8080/santa`, {name: santaName});
            handleClose(santa.id);
        } catch (error) {
            handleClose(null);
        }
    }

    return (
      <Dialog onClose={() => handleClose(null)} open={open}>
          <DialogTitle>Set backup account</DialogTitle>
          <TextField id="name" label="Name" onChange={e => setSantaName(e.target.value)}/>
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
    const [santaList, setSantaList] = useState<Santa[]>();
    const [computed, setComputed] = useState(false);
    const [santaRunList, setSantaRunList] = useState<SantaRun[]>([]);
    const [openDgNewSanta, setOpenDgNewSanta] = useState(false)

    async function updateSanta(newSanta?: Santa) {
        onSelectSanta(newSanta);
        if (!newSanta) {
            setSantaRunList([]);
            onSelectRun(undefined);
            setComputed(false);
            return;
        }
        const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/santa/${newSanta.id}/run`);
        setSantaRunList(newSantaRunList);
        if (newSantaRunList.length === 0) {
            onSelectRun(undefined);
            setComputed(false);
            return;
        }
        const lastRun: SantaRun | undefined = await get(`http://localhost:8080/santa/${newSanta.id}/run/${newSantaRunList[0].id}`);
        onSelectRun(lastRun);
        setComputed(!!lastRun && lastRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
    }

    useEffect(() => {
        get('http://localhost:8080/santa').then(res => setSantaList(res));
        if (!selectedSanta) {
            get('http://localhost:8080/last-santa').then(res => updateSanta(res));
        } else {
            get(`http://localhost:8080/santa/${selectedSanta.id}/run`).then(res => setSantaRunList(res));
        }
        setComputed(!!selectedRun && selectedRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
    }, []);

    async function refresh() {
        const newSantaList: Santa[] = await get('http://localhost:8080/santa');
        setSantaList(newSantaList);

        if (selectedSanta) {
            const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/santa/${selectedSanta.id}/run`);
            setSantaRunList(newSantaRunList);
        }
    }

    async function newSanta(id: number | null | undefined) {
        setOpenDgNewSanta(false);
        if (id === null) {
            return;
        }
        get('http://localhost:8080/santa').then(res => setSantaList(res));
        const newSanta: Santa = await get(`http://localhost:8080/santa/${id}`);
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
        const newSantaRun: SantaRun = await get(`http://localhost:8080/santa/${selectedSanta?.id}/run/${selectedSantaRun.id}`);
        onSelectRun(newSantaRun);
        setComputed(!!newSantaRun && newSantaRun.peopleList.every(p => p.idPeopleTo !== undefined && p.idPeopleFrom !== undefined));
    }

    async function compute() {
        const result: ComputeReply = await post(`http://localhost:8080/compute/${selectedSanta?.id}`, selectedRun);
        if (result.ok) {
            onSelectRun(result.santaRun);
            const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/santa/${selectedSanta?.id}/run`);
            setSantaRunList(newSantaRunList);
            setComputed(true);
        }
    }

    async function reshuffle() {
        selectedRun.peopleList.forEach(santa => {
            santa.idPeopleTo = undefined;
            santa.idPeopleFrom = undefined;
        });
        await compute();
    }

    async function sendMail() {

    }

    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    Secret Santa
                    {selectedSanta ? ` - ${selectedSanta.name} [${selectedSanta.creationDate}]` : ''}
                    {selectedRun ? ` - ${selectedRun.peopleList.length} people` : ''}
                </Typography>
                <Button disabled={!selectedSanta} color="inherit" onClick={() => selectedSanta ? onManage(selectedSanta, selectedRun) : null}>Manage</Button>
                <Button color="inherit" onClick={() => setOpenDgNewSanta(true)}>New</Button>
            </Toolbar>
        </AppBar>

        <div className={styles.mainPanel}>
            <div className={styles.subPanel}>
                <div className={styles.listNames}>
                    {selectedRun ? <div>
                        {selectedRun.peopleList.map((person: SantaRunPeople) =>
                          <Link key={person.idPeople} person={person} peopleList={peopleList}></Link>)
                        }
                    </div> : ''}
                </div>
                <div className={styles.actionBar}>
                    <Button onClick={compute} startIcon={<AutoFixHighIcon/>} variant={"outlined"}>Compute</Button>
                    <Button onClick={reshuffle} disabled={!computed} startIcon={<ShuffleIcon/>} variant={"outlined"}>Reshuffle</Button>
                    <Button onClick={sendMail} disabled={!computed} startIcon={<SendIcon/>} variant={"contained"}>Send Mail</Button>
                </div>
            </div>
            <div className={styles.rightPanel}>
                <RightPanel santaList={santaList ? santaList : []} santa={selectedSanta} santaRunList={santaRunList}
                            santaRun={selectedRun} onSelectSanta={selectSanta} onSelectRun={selectRun} onRefresh={refresh}></RightPanel>
            </div>
        </div>

        <NewSantaDialog open={openDgNewSanta} handleClose={(id) => newSanta(id)}></NewSantaDialog>
    </>
}

export default Overview;
