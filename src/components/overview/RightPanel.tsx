import "./RightPanel.css";
import {Santa, SantaRun} from "../../model";
import {formatDate} from "../../Utils";

function ListItem({name, creationDate, lastUpdate}: {name: string, creationDate?: string, lastUpdate?: string}) {

  return (
    <div className="item-content">
      <div className="name">{name}</div>
      <div className="date">{formatDate(creationDate)}</div>
    </div>
  );
}

function RightPanel({santaList, santa, santaRunList, santaRun, onSelectSanta, onSelectRun}:
                      {
                        santaList: Santa[], santa?: Santa, santaRunList: SantaRun[], santaRun?: SantaRun,
                        onSelectSanta: (santa: Santa) => void, onSelectRun: (santaRun: SantaRun) => void}) {
  function selectSanta(selectedSanta: Santa) {
    if (selectedSanta.id !== santa?.id) {
      onSelectSanta(selectedSanta);
    }
  }

  function selectRun(selectedSantaRun: SantaRun) {
    if (selectedSantaRun.id !== santaRun?.id) {
      onSelectRun(selectedSantaRun);
    }
  }

  return (
    <div className="panel">
      <div className="subPanel">
        <h3>SecretSantas</h3>
        <div className="list">
          {santaList.map(value =>
            <div key={value.id} className={value.id === santa?.id ? 'selected item' : 'item'} onClick={() => selectSanta(value)}>
              <ListItem name={value.name} creationDate={value.creationDate} lastUpdate={value.lastUpdate}></ListItem>
            </div>
          )}
        </div>
      </div>
      <div className="subPanel">
        <h3>Runs</h3>
        <div className="list">
          {santaRunList.map((value, index) =>
            <div key={value.id} className={value.id === santaRun?.id ? 'selected item' : 'item'} onClick={() => selectRun(value)}>
              <ListItem name={`${index} [#${value.peopleList.length}]`} creationDate={value.creationDate} lastUpdate={value.lastUpdate}></ListItem>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RightPanel;
