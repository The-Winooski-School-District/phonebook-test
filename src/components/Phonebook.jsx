import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { Importer, ImporterField } from "react-csv-importer";
import { CSVLink } from "react-csv";
/*import CSVReader from "react-csv-reader";*/

function Phonebook() {
  const [contacts, setContacts] = useState([]);
  const [loadedData, setLoadedData] = useState([]);

  const seasonid = "-NUSSOwaaO4GYX8K9twl";

  useEffect(() => {
    const phonebookRef = db.ref(`seasons/${seasonid}/teams`);
    phonebookRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const contactArray = Object.entries(data).map(([key, value]) => {
          return { id: key, ...value };
        });
        setContacts(contactArray);
      } else {
        setContacts([]);
      }
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newContact = {
      teamId: teamId,
      name: name,
      abbr: abbr,
      teamPage: teamPage,
      teamPic: teamPic,
      coaches: coaches,
      multi: multi
    };
    db.ref(`seasons/${seasonid}/teams`).push(newContact);
    setTeamId("");
    setName("");
    setAbbr("");
    setTeamPage("");
    setTeamPic("");
    setCoaches("");
    setMulti("");
  };

  /*const handleFileLoaded = (data, fileInfo) => {
    const newContacts = data.map((row) => ({
      teamId: row.TeamId,
      name: row.Name,
      abbr: row.Abbr,
      teamPage: row.TeamPage,
      teamPic: row.TeamPic,
      coaches: row.Coaches,
      multi: row.Multi
    }));
    const uniqueNewContacts = newContacts.filter((newContact) => {
      let found = false;
      for (let i = 0; i < loadedData.length; i++) {
        const loadedContact = loadedData[i];
        if (
          loadedContact &&
          loadedContact.teamId &&
          loadedContact.name &&
          loadedContact.abbr &&
          loadedContact.teamPage &&
          loadedContact.teamPic &&
          loadedContact.coaches &&
          loadedContact.multi &&
          loadedContact.name === newContact.name
        ) {
          found = true;
          break;
        }
      }
      return !found;
    });
    if (uniqueNewContacts.length === 0) {
      alert("The file you uploaded contains only duplicates.");
    } else {
      setContacts([...contacts, ...uniqueNewContacts]);
    }
  };*/
  
  const [teamId, setTeamId] = useState("");
  const [name, setName] = useState("");
  const [abbr, setAbbr] = useState("");
  const [teamPage, setTeamPage] = useState("");
  const [teamPic, setTeamPic] = useState("");
  const [coaches, setCoaches] = useState("");
  const [multi, setMulti] = useState("");

  const csvData = contacts.map(({ teamId, name, abbr, teamPage, teamPic, coaches, multi }) => ({ teamId, name, abbr, teamPage, teamPic, coaches, multi }));

  const handleData = async (rows, { startIndex }) => {
    try {
      const newContacts = rows.map((row) => ({
        teamId: row.teamId,
        name: row.name,
        abbr: row.abbr,
        teamPage: row.teamPage,
        teamPic: row.teamPic,
        coaches: row.coaches,
        multi: row.multi
      }));
      if (newContacts.length > 0) {
        const uniqueNewContacts = newContacts.filter(
          (newContact) =>
            !loadedData.find(
              (loadedContact) =>
                loadedContact &&
                loadedContact.teamId &&
                loadedContact.name &&
                loadedContact.abbr &&
                loadedContact.teamPage &&
                loadedContact.teamPic &&
                loadedContact.coaches &&
                loadedContact.multi &&
                loadedContact.name.toLowerCase() ===
                    newContact.name.toLowerCase()
            )
        );
        if (uniqueNewContacts.length === 0) {
          alert("The file you uploaded contains only duplicates.");
        } else {
          const phonebookRef = db.ref(`seasons/${seasonid}/teams`);
          uniqueNewContacts.forEach((newContact) => {
            phonebookRef.push(newContact);
          });
          setContacts([...contacts, ...uniqueNewContacts]);
          setLoadedData([...loadedData, ...newContacts]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label>
          team id:
          <input
            type="text"
            value={teamId}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Abbr:
          <input
            type="text"
            value={abbr}
            onChange={(e) => setAbbr(e.target.value)}
          />
        </label>
        <label>
          Page:
          <input
            type="text"
            value={teamPage}
            onChange={(e) => setTeamPage(e.target.value)}
          />
        </label>
        <label>
          Pic:
          <input
            type="text"
            value={teamPic}
            onChange={(e) => setTeamPic(e.target.value)}
          />
        </label>
        <label>
          coaches:
          <input
            type="text"
            value={coaches}
            onChange={(e) => setCoaches(e.target.value)}
          />
        </label>
        <label>
          Multi:
          <input
            type="tel"
            value={multi}
            onChange={(e) => setMulti(e.target.value)}
          />
        </label>
        <button type="submit">Add Contact</button>
      </form>
      <Importer
        className="drag-n-drop"
        delimiter=","
        onError={(err) => console.log(err)}
        dataHandler={handleData}
      >
        <ImporterField name="teamId" label="Team Id" />
        <ImporterField name="name" label="Name" />
        <ImporterField name="abbr" label="Abbr" />
        <ImporterField name="teamPage" label="TeamPage" />
        <ImporterField name="teamPic" label="TeamPic" />
        <ImporterField name="coaches" label="Coaches" />
        <ImporterField name="multi" label="Multi" />
      </Importer>
      <button
        onClick={() => {
          if (document.getElementById("react-csv-reader-input"))
            document.getElementById("react-csv-reader-input").click();
        }}
      >
        Upload CSV
      </button>
      {/*}
      <CSVReader
        onFileLoaded={handleFileLoaded}
        inputStyle={{ display: "none" }}
        parserOptions={{
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        }}
      />
      */}
      <table>
        <thead>
          <tr>
            <th>Team Id</th>
            <th>Name</th>
            <th>abbr</th>
            <th>page</th>
            <th>pic</th>
            <th>coaches</th>
            <th>multi</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.teamId}</td>
              <td>{contact.name}</td>
              <td>{contact.abbr}</td>
              <td>{contact.teamPage}</td>
              <td>{contact.teamPic}</td>
              <td>{contact.coaches}</td>
              <td>{contact.multi}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <CSVLink
        data={csvData}
        filename={"phonebook.csv"}
        target="_blank"
        omit={["id"]}
      >
        Export to CSV
      </CSVLink>
    </div>
  );
}

export default Phonebook;
