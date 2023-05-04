import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { Importer, ImporterField } from "react-csv-importer";
/*import { CSVLink } from "react-csv";
import CSVReader from "react-csv-reader";*/

function TeamFinderAndScheduleAdder() {
  const [seasons, setSeasons] = useState([]);
  const [teams, setTeams] = useState([]);
  const [opponents, setOpponents] = useState([]);
  const [loadedData, setLoadedData] = useState([]);

  if (!teams && !opponents) {
    /*do nothing*/
  }

  useEffect(() => {
    const opponentsRef = db.ref("opponents");
    opponentsRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const opponentsArray = Object.entries(data).map(([key, value]) => {
          return { id: key, ...value };
        });
        setOpponents(opponentsArray);
        // fetch the oppId from the opponents array
        for (const opponent in opponentsArray) {
          console.log(opponentsArray[opponent].oppId); //important
          console.log(opponentsArray[opponent].name); //important?!
        }
      }
    });

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
      const opponentsMap = new Map(
        opponents.map(({ oppId, name }) => [oppId, name])
      ); // create a map of oppId -> name
      data = data.map((schedule) => ({
        ...schedule,
        opponent: opponentsMap.get(schedule.opponent),
      })); // replace Opponent ID with name
      const newSchedules = data.filter(
        (schedule) =>
          !loadedData.find(
            (loadedPlayer) =>
              loadedPlayer.teamId === schedule.teamId &&
              loadedPlayer.opponent === schedule.opponent &&
              loadedPlayer.home === schedule.home &&
              loadedPlayer.address === schedule.address &&
              loadedPlayer.number === schedule.number &&
              loadedPlayer.date === schedule.date &&
              loadedPlayer.time === schedule.time &&
              loadedPlayer.date2 === schedule.date2 &&
              loadedPlayer.time2 === schedule.time2 &&
              loadedPlayer.w_score === schedule.w_score &&
              loadedPlayer.w_score2 === schedule.w_score2 &&
              loadedPlayer.o_score === schedule.o_score &&
              loadedPlayer.o_score2 === schedule.o_score2 &&
              loadedPlayer.notes === schedule.notes
          )
      );
      setLoadedData(loadedData.concat(newSchedules));

      const promises = [];
      for (const season of seasons) {
        for (let team in season.teams) {
          const scheduleRef = db.ref(
            `seasons/${season.id}/teams/${team}/schedule`
          );
          const teamSchedule = newSchedules.filter(
            (schedule) => schedule.teamId === season.teams[team].teamId
          );
          if (teamSchedule.length > 0) {
            promises.push(
              scheduleRef.once("value").then((snapshot) => {
                const existingSchedule = snapshot.val() || [];
                const newSchedule = existingSchedule.concat(
                  teamSchedule.filter(
                    (schedule) =>
                      !existingSchedule.some(
                        (existingSchedule) =>
                          existingSchedule.teamId === schedule.teamId &&
                          existingSchedule.opponent === schedule.opponent &&
                          existingSchedule.home === schedule.home &&
                          existingSchedule.address === schedule.address &&
                          existingSchedule.number === schedule.number &&
                          existingSchedule.date === schedule.date &&
                          existingSchedule.time === schedule.time &&
                          existingSchedule.date2 === schedule.date2 &&
                          existingSchedule.time2 === schedule.time2 &&
                          existingSchedule.w_score === schedule.w_score &&
                          existingSchedule.w_score2 === schedule.w_score2 &&
                          existingSchedule.o_score === schedule.o_score &&
                          existingSchedule.o_score2 === schedule.o_score2 &&
                          existingSchedule.notes === schedule.notes
                      )
                  )
                );
                return scheduleRef.set(newSchedule);
              })
            );
          }
        }
      }

      Promise.all(promises)
        .then(() => {
          console.log("All updates complete");
        })
        .catch((error) => {
          console.error("Error updating database:", error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <h1>ADD SCHEDULE</h1>
      <Importer
        className="drag-n-drop"
        delimiter=","
        onError={(err) => console.log(err)}
        dataHandler={handleData}
      >
        <ImporterField name="teamId" label="Team ID" />
        <ImporterField name="opponent" label="Opponent ID" />
        <ImporterField name="home" label="Home" />
        <ImporterField name="address" label="Address" />
        <ImporterField name="date" label="Date" />
        <ImporterField name="time" label="Time" />
        <ImporterField name="date2" label="Date2" />
        <ImporterField name="time2" label="Time2" />
        <ImporterField name="w_score" label="w_score" />
        <ImporterField name="w_score2" label="w_score2" />
        <ImporterField name="o_score" label="o_score" />
        <ImporterField name="o_score2" label="o_score2" />
        <ImporterField name="notes" label="Notes" />
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
            <th>Opponent</th>
            <th>Home</th>
            <th>Address</th>
            <th>Date</th>
            <th>Time</th>
            <th>Date2</th>
            <th>Time2</th>
            <th>w_score</th>
            <th>w_score2</th>
            <th>o_score</th>
            <th>o_score2</th>
            <th>notes</th>
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

export default TeamFinderAndScheduleAdder;
