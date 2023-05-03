import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { Importer, ImporterField } from "react-csv-importer";
/*import { CSVLink } from "react-csv";
import CSVReader from "react-csv-reader";*/

function TeamFinderAndDetailAdder() {
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loadedData, setLoadedData] = useState([]);

  if (!teams) {
    /*do nothing*/
  }

  useEffect(() => {
    const seasonsRef = db.ref("seasons");
    seasonsRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const seasonsArray = Object.entries(data).map(([key, value]) => {
          return { id: key, ...value };
        });
        setSeasons(seasonsArray);
        // fetch the teams from the first season
        const teamsArray = Object.entries(seasonsArray[0].teams).map(
          ([key, value]) => {
            return { id: key, ...value };
          }
        );
        setTeams(teamsArray);
      } else {
        setSeasons([]);
        setTeams([]);
      }
    });
  }, []);

  const handleData = async (data, { startIndex }) => {
    console.log("Loop starting...");
    try {
      const newPlayers = data.filter(
        (player) =>
          !loadedData.find(
            (loadedPlayer) =>
              loadedPlayer.teamId === player.teamId &&
              loadedPlayer.fName === player.fName &&
              loadedPlayer.lName === player.lName &&
              loadedPlayer.grade === player.grade &&
              loadedPlayer.number === player.number &&
              loadedPlayer.position === player.position &&
              loadedPlayer.multi === player.multi &&
              loadedPlayer.captain === player.captain
          )
      );
      setLoadedData(loadedData.concat(newPlayers));
  
      const promises = [];
      for (const season of seasons) {
        for (let team in season.teams) {
          const rosterRef = db.ref(`seasons/${season.id}/teams/${team}/roster`);
          const teamPlayers = newPlayers.filter(
            (player) => player.teamId === season.teams[team].teamId
          );
          if (teamPlayers.length > 0) {
            promises.push(
              rosterRef.once("value").then((snapshot) => {
                const existingRoster = snapshot.val() || [];
                const newRoster = existingRoster.concat(teamPlayers.filter(
                  (player) => !existingRoster.some(
                    (existingPlayer) =>
                      existingPlayer.teamId === player.teamId &&
                      existingPlayer.fName === player.fName &&
                      existingPlayer.lName === player.lName &&
                      existingPlayer.grade === player.grade &&
                      existingPlayer.number === player.number &&
                      existingPlayer.position === player.position &&
                      existingPlayer.multi === player.multi &&
                      existingPlayer.captain === player.captain
                  )
                ));
                return rosterRef.set(newRoster);
              })
            );
          }
        }
      }
  
      Promise.all(promises).then(() => {
        console.log("All updates complete");
      }).catch((error) => {
        console.error("Error updating database:", error);
      });
    } catch (error) {
      console.log(error);
    }
  };
  
  

  return (
    <div>
      <Importer
        className="drag-n-drop"
        delimiter=","
        onError={(err) => console.log(err)}
        dataHandler={handleData}
      >
        <ImporterField name="teamId" label="Team ID" />
        <ImporterField name="fName" label="FName" />
        <ImporterField name="lName" label="LName" />
        <ImporterField name="grade" label="Grade" />
        <ImporterField name="number" label="Number" />
        <ImporterField name="position" label="Position" />
        <ImporterField name="multi" label="Team(s)" />
        <ImporterField name="captain" label="Captain" />
      </Importer>
      <button
        onClick={() => {
          if (document.getElementById("react-csv-reader-input"))
            document.getElementById("react-csv-reader-input").click();
        }}
      >
        Upload CSV
      </button>
      <table>
        <thead>
          <tr>
            <th>teamId</th>
            <th>fName</th>
            <th>lName</th>
            <th>grade</th>
            <th>number</th>
            <th>position</th>
            <th>multi</th>
            <th>captain</th>
          </tr>
        </thead>
        <tbody>
          {/* display contacts
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.phone}</td>
            </tr>
          ))} */}
        </tbody>
      </table>
    </div>
  );
}

export default TeamFinderAndDetailAdder;
