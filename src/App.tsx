import React, {useEffect, useState} from 'react';
import './App.css';
import Overview from "./components/overview/Overview";
import Manage from "./components/manage/Manage";
import {Person, PersonGroup, Santa, SantaRun} from "./model";
import {get} from "./Utils";

function App() {
  const [peopleList, setPeopleList] = useState<Person[]>([]);
  const [page, setPage] = useState<string>('overview');

  const [selectedSanta, setSelectedSanta] = useState<Santa>()
  const [selectedRun, setSelectedRun] = useState<SantaRun>({peopleList: []})
  const [filters, setFilters] = useState<PersonGroup[]>([]);
  const [availableFilters, setAvailableFilters] = useState<PersonGroup[]>([]);

  function updateSelectedRun(selectedRun?: SantaRun) {
    selectedRun ? setSelectedRun(JSON.parse(JSON.stringify(selectedRun))) : setSelectedRun({peopleList: []});
  }

  useEffect(() => {
    refreshPeopleList(() => {});
    refreshAvailableFilters();
  }, []);

  function refreshAvailableFilters() {
    get(`http://localhost:8080/person/people-group`).then((res: PersonGroup[]) => setAvailableFilters(res));
  }

  function refreshPeopleList(cbk: () => void) {
    get("http://localhost:8080/person/people").then(res => {
      setPeopleList(res);
      cbk();
    });
  }

  function onBackFromManage(selectedRun: SantaRun) {
    updateSelectedRun(selectedRun);
    setPage('overview');
  }

  return (
    <div>
      {page === 'overview' ?
        <Overview peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun} availableFilters={availableFilters}
                  onSelectSanta={setSelectedSanta} onSelectRun={updateSelectedRun} onManage={() => setPage('manage')} filters={filters} onSetFilters={setFilters}></Overview>
        : <Manage peopleList={peopleList} selectedSanta={selectedSanta} selectedRun={selectedRun} onBack={onBackFromManage}
                  onUpdatedPeopleList={refreshPeopleList} filters={filters} onSetFilters={setFilters} availableFilters={availableFilters} onRefreshAvailableFilters={refreshAvailableFilters}></Manage>
      }
    </div>
  );
}

export default App;
