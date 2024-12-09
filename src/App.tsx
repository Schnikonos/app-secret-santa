import React, {useEffect, useState} from 'react';
import './App.css';
import Overview from "./components/overview/Overview";
import Manage from "./components/manage/Manage";
import {Person, Santa, SantaRun} from "./model";
import {get} from "./Utils";

function App() {
  const [peopleList, setPeopleList] = useState<Person[]>([]);
  const [page, setPage] = useState<string>('overview');

  const [selectedSanta, setSelectedSanta] = useState<Santa>()
  const [selectedRun, setSelectedRun] = useState<SantaRun>({peopleList: []})

  function updateSelectedRun(selectedRun?: SantaRun) {
    selectedRun ? setSelectedRun(JSON.parse(JSON.stringify(selectedRun))) : setSelectedRun({peopleList: []});
  }

  useEffect(() => {
    refreshPeopleList(() => {});
  }, []);

  function refreshPeopleList(cbk: () => void) {
    get("http://localhost:8080/people").then(res => {
      setPeopleList(res);
      cbk();
    });
  }

  return (
    <div>
      {page === 'overview' ?
        <Overview peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun}
                  onSelectSanta={setSelectedSanta} onSelectRun={updateSelectedRun} onManage={() => setPage('manage')}></Overview>
        : <Manage peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun} onBack={() => setPage('overview')} onUpdatedPeopleList={refreshPeopleList}></Manage>
      }
    </div>
  );
}

export default App;
