import "./App.css";
/*import Phonebook from "./components/Phonebook";*/
import TeamFinderAndRosterAdder from "./components/TeamFinderAndRosterAdder";
import TeamFinderAndScheduleAdder from "./components/TeamFinderAndScheduleAdder";

function App() {
  return (
    <div>
      <TeamFinderAndScheduleAdder /> 
      <TeamFinderAndRosterAdder />
      {/*<Phonebook />*/}
    </div>
  );
}

export default App;
