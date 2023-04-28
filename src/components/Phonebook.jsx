import React, { useState, useEffect } from "react";
import { db } from "./Firebase";
import { Importer, ImporterField } from "react-csv-importer";
import { CSVLink } from "react-csv";
import CSVReader from "react-csv-reader";

function Phonebook() {
  const [contacts, setContacts] = useState([]);
  const [loadedData, setLoadedData] = useState([]);

  useEffect(() => {
    const phonebookRef = db.ref("z_phonebook-test");
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
      name: name,
      phone: phone,
    };
    db.ref("z_phonebook-test").push(newContact);
    setName("");
    setPhone("");
  };

  const handleFileLoaded = (data, fileInfo) => {
    const newContacts = data.map((row) => ({
      name: row.Name,
      phone: row.Phone,
    }));
    const uniqueNewContacts = newContacts.filter((newContact) => {
      let found = false;
      for (let i = 0; i < loadedData.length; i++) {
        const loadedContact = loadedData[i];
        if (
          loadedContact &&
          loadedContact.name &&
          loadedContact.phone &&
          loadedContact.name === newContact.name &&
          loadedContact.phone === newContact.phone
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
      const phonebookRef = db.ref("z_phonebook-test");
      uniqueNewContacts.forEach((newContact) => {
        phonebookRef.push(newContact);
      });
      setContacts([...contacts, ...uniqueNewContacts]);
    }
  };
  

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const csvData = contacts.map(({ name, phone }) => ({ name, phone }));

  const handleData = async (rows, { startIndex }) => {
    try {
      const newContacts = rows.map((row) => ({
        name: row.name,
        phone: row.phone,
      }));
      if (newContacts.length > 0) {
        const uniqueNewContacts = newContacts.filter(
          (newContact) =>
            !loadedData.find(
              (loadedContact) =>
                loadedContact &&
                loadedContact.name &&
                loadedContact.phone &&
                loadedContact.name.toLowerCase() ===
                  newContact.name.toLowerCase() &&
                loadedContact.phone === newContact.phone
            )
        );
        if (uniqueNewContacts.length === 0) {
          alert("The file you uploaded contains only duplicates.");
        } else {
          const phonebookRef = db.ref("z_phonebook-test");
          uniqueNewContacts.forEach((newContact) => {
            phonebookRef.push(newContact);
          });
          setContacts([...contacts, ...uniqueNewContacts]);
          setLoadedData([...loadedData, newContacts[0]]);
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
          Name:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          Phone:
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
        <ImporterField name="name" label="Name" />
        <ImporterField name="phone" label="Phone" />
      </Importer>
      <button
        onClick={() => {
          if (document.getElementById("react-csv-reader-input"))
            document.getElementById("react-csv-reader-input").click();
        }}
      >
        Upload CSV
      </button>
      <CSVReader
        onFileLoaded={handleFileLoaded}
        inputStyle={{ display: "none" }}
        parserOptions={{
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
        }}
      />
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr key={contact.id}>
              <td>{contact.name}</td>
              <td>{contact.phone}</td>
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
