import './Overview.css';
import {AppBar, Button, Dialog, DialogTitle, TextField, Toolbar, Typography} from "@mui/material";
import {Person, Santa, SantaRun, SantaRunPeople} from "../../model";
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
    const [santaRunList, setSantaRunList] = useState<SantaRun[]>([]);
    const [openDgNewSanta, setOpenDgNewSanta] = useState(false)

    async function updateSanta(newSanta: Santa) {
        onSelectSanta(newSanta);
        if (!newSanta) {
            setSantaRunList([]);
            onSelectRun(undefined);
            return;
        }
        const newSantaRunList: SantaRun[] = await get(`http://localhost:8080/santa/${newSanta.id}/run`);
        setSantaRunList(newSantaRunList);
        if (newSantaRunList.length === 0) {
            onSelectRun(undefined);
            return;
        }
        const lastRun = await get(`http://localhost:8080/santa/${newSanta.id}/run/${newSantaRunList[0].id}`);
        onSelectRun(lastRun);
    }

    useEffect(() => {
        if (!selectedSanta) {
            get('http://localhost:8080/last-santa').then(res => updateSanta(res));
        }
        get('http://localhost:8080/santa').then(res => setSantaList(res));
    }, []);

    async function newSanta(id: number | null | undefined) {
        setOpenDgNewSanta(false);
        if (id === null) {
            return;
        }
        get('http://localhost:8080/santa').then(res => setSantaList(res));
        const newSanta: Santa = await get(`http://localhost:8080/santa/${id}`);
        await updateSanta(newSanta);
    }

    function selectSanta(selectedSanta: Santa) {
        updateSanta(selectedSanta);
    }

    function selectRun(selectedSantaRun: SantaRun) {
        onSelectRun(selectedSantaRun);
    }

    return <>
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                    Secret Santa
                    {selectedSanta ? ` - ${selectedSanta.name} [${selectedSanta.creationDate}]` : ''}
                    {selectedRun ? ` - #${selectedRun.peopleList.length}` : ''}
                </Typography>
                <Button disabled={!selectedSanta} color="inherit" onClick={() => selectedSanta ? onManage(selectedSanta, selectedRun) : null}>Manage</Button>
                <Button color="inherit" onClick={() => setOpenDgNewSanta(true)}>New</Button>
            </Toolbar>
        </AppBar>

        <div className="main-panel">
            <div style={{backgroundColor: 'palegreen'}}>
                {selectedRun ? <div>
                    {selectedRun.peopleList.map((person: SantaRunPeople) =>
                      <Link key={person.idPeople} person={person} peopleList={peopleList}></Link>)
                    }
                </div> : ''}
                <div>
                    <Button>Recompute</Button>
                    <Button>Send Mail</Button>
                </div>
            </div>
            <div>
                <RightPanel santaList={santaList ? santaList : []} santa={selectedSanta} santaRunList={santaRunList} santaRun={selectedRun} onSelectSanta={selectSanta} onSelectRun={selectRun}></RightPanel>
            </div>
        </div>

        <NewSantaDialog open={openDgNewSanta} handleClose={(id) => newSanta(id)}></NewSantaDialog>
    </>
}

export default Overview;
