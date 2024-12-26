import React, {useEffect, useState} from 'react';
import './App.css';
import Overview from "./components/overview/Overview";
import Manage from "./components/manage/Manage";
import {ErrorMessage, Person, PersonGroup, Santa, SantaRun, SnackbarState} from "./model";
import {get} from "./Utils";
import MailManager from "./components/mailManager/MailManager";
import ConfirmModal from "./components/common/ConfirmModal";
import ErrorDialog from "./components/common/ErrorDialog";
import {Alert, Snackbar} from "@mui/material";

function App() {
  const [peopleList, setPeopleList] = useState<Person[]>([]);
  const [page, setPage] = useState<string>('overview');

  const [selectedSanta, setSelectedSanta] = useState<Santa>()
  const [selectedRun, setSelectedRun] = useState<SantaRun>({peopleList: []})
  const [filters, setFilters] = useState<PersonGroup[]>([]);
  const [availableFilters, setAvailableFilters] = useState<PersonGroup[]>([]);

  const [openConfirmModal, setOpenConfirmModal] = useState<boolean>(false);
  const [confirmModalMsg, setConfirmModalMsg] = useState<string>('');
  const [confirmModalCbk, setConfirmModalCbk] = useState<(res: boolean) => void>(() => {});

  const [openErrorDialog, setOpenErrorDialog] = useState<boolean>(false);
  const [errorDialogMsg, setErrorDialogMsg] = useState<ErrorMessage>();

  const [openSnakbar, setOpenSnakbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarState, setSnackbarState] = useState<SnackbarState>('success');

  function updateSelectedRun(selectedRun?: SantaRun) {
    selectedRun ? setSelectedRun(JSON.parse(JSON.stringify(selectedRun))) : setSelectedRun({peopleList: []});
  }

  useEffect(() => {
    refreshPeopleList(() => {});
    refreshAvailableFilters();
  }, []);

  function refreshAvailableFilters() {
    get(`/person/people-group`).then((res: PersonGroup[]) => setAvailableFilters(res)).catch(err => onErrorDialog({message: 'Error while getting the groups', err}));
  }

  function refreshPeopleList(cbk: () => void) {
    get("/person/people").then(res => {
      setPeopleList(res);
      cbk();
    }).catch(err => onErrorDialog({message: 'Error while getting people', err}));
  }

  function onBackFromManage(selectedRun: SantaRun) {
    updateSelectedRun(selectedRun);
    setPage('overview');
  }

  function onConfirmModal(msg: string, cbk: () => void) {
    setOpenConfirmModal(true);
    setConfirmModalMsg(msg);
    setConfirmModalCbk(() => (res: boolean) => {
      if (res === undefined) {
        return;
      }
      setOpenConfirmModal(false);
      setConfirmModalCbk(() => {});
      if (res) {
        cbk();
      }
    });
  }

  function onErrorDialog(msg: ErrorMessage) {
    console.error(msg);
    setOpenErrorDialog(true);
    setErrorDialogMsg(msg);
  }

  function onSnackbar(msg: string, state: SnackbarState) {
    setSnackbarMsg(msg);
    setSnackbarState(state);
    setOpenSnakbar(true);
  }

  return (
    <>
      <div>
        {page === 'overview' ?
          <Overview peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun}
                    availableFilters={availableFilters}
                    onSelectSanta={setSelectedSanta} onSelectRun={updateSelectedRun} onManage={() => setPage('people')}
                    filters={filters} onSetFilters={setFilters} onManageMail={() => setPage('mail')} onConfirmModal={onConfirmModal}
                    onErrorDialog={onErrorDialog} onSnackbar={onSnackbar}
          ></Overview>
          : page === 'people' ? <Manage peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun}
                                        onBack={onBackFromManage}
                                        onUpdatedPeopleList={refreshPeopleList} filters={filters}
                                        onSetFilters={setFilters} availableFilters={availableFilters}
                                        onRefreshAvailableFilters={refreshAvailableFilters}
                                        onErrorDialog={onErrorDialog} onSnackbar={onSnackbar}
            ></Manage>
            : page === 'mail' &&
            <MailManager onBack={() => setPage('overview')} onConfirmModal={onConfirmModal}
                         onErrorDialog={onErrorDialog} onSnackbar={onSnackbar}
            ></MailManager>
        }
      </div>
      <ConfirmModal open={openConfirmModal} message={confirmModalMsg} onClose={confirmModalCbk}></ConfirmModal>
      <ErrorDialog message={errorDialogMsg} open={openErrorDialog} onClose={() => setOpenErrorDialog(false)}></ErrorDialog>
      <Snackbar open={openSnakbar} autoHideDuration={5000} onClose={() => setOpenSnakbar(false)}>
        <Alert severity={snackbarState} onClose={() => setOpenSnakbar(false)}>{snackbarMsg}</Alert>
      </Snackbar>
    </>
  );
}

export default App;
