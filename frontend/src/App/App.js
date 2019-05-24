import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import AppContext from '../AppContext';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import AddFolder from '../AddFolder/AddFolder';
import AddNote from '../AddNote/AddNote';
import {
  getNotesForFolder,
  findNote,
  findFolder,
  countNotesForFolder
} from '../notes-helpers';
import './App.css';

class App extends Component {
  state = {
    notes: [],
    folders: []
  };

  componentDidMount() {
    fetch('http://localhost:8000/api/folders')
      .then(res => res.json())
      .then(resJson =>
        this.setState({
          folders: resJson
        })
      )
      .catch(error => console.log(error));

    fetch('http://localhost:8000/api/notes')
      .then(res => res.json())
      .then(resJson =>
        this.setState({
          notes: resJson
        })
      )
      .catch(error => console.log(error));
  }

  postFolderName(folderName) {
    const url = 'http://localhost:8000/api/folders';
    fetch(url, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ name: folderName })
    })
      .then(res => res.json())
      .then(res => console.log(res));
  }

  addNote(event, noteName, noteContent, folderId) {
    console.log('noteName', noteName);
    const url = 'http://localhost:8000/api/notes';
    fetch(url, {
      method: 'post',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: noteName,
        content: noteContent,
        folderId: folderId
      })
    })
      .then(res => res.json())
      .then(res => console.log(res));
  }

  renderNavRoutes() {
    const { notes, folders } = this.state;
    console.log('renderNaveRoutes', this.state);
    return (
      <>
        {['/', '/folder/:folder_id'].map(path => (
          <Route exact key={path} path={path} component={NoteListNav} />
        ))}
        <Route
          path="/note/:note_id"
          render={routeProps => {
            console.log(routeProps);
            const { note_id } = routeProps.match.params;
            const note = findNote(notes, note_id) || {};
            const folder = findFolder(folders, note.folder_id);
            return <NotePageNav {...routeProps} folder={folder} />;
          }}
        />
        <Route path="/add-folder" component={NotePageNav} />
        <Route path="/add-note" component={NotePageNav} />
      </>
    );
  }

  renderMainRoutes() {
    const { notes } = this.state;
    console.log('rendermainroutes', this.state);
    return (
      <>
        {['/', '/folder/:folder_id'].map(path => (
          <Route
            exact
            key={path}
            path={path}
            render={routeProps => {
              const { folder_id } = routeProps.match.params;
              console.log('routeprops', routeProps.match.params);
              const notesForFolder = getNotesForFolder(notes, folder_id);
              return <NoteListMain {...routeProps} notes={notesForFolder} />;
            }}
          />
        ))}
        <Route
          path="/note/:note_id"
          render={routeProps => {
            const { note_id } = routeProps.match.params;
            const note = findNote(notes, note_id);
            return <NotePageMain {...routeProps} note={note} />;
          }}
        />
        <Route path="/add-folder" component={AddFolder} />
        <Route path="/add-note" component={AddNote} />
      </>
    );
  }

  handleDeleteNote = id => {
    let newNotes = this.state.notes.filter(note => {
      return note.id !== id;
    });
    this.setState({
      notes: newNotes
    });
  };

  render() {
    const contextValue = {
      folders: this.state.folders,
      notes: this.state.notes,
      deleteNote: this.handleDeleteNote,
      addFolder: this.postFolderName,
      addNote: this.addNote
    };

    return (
      <AppContext.Provider value={contextValue}>
        <div className="App">
          <nav className="App__nav">{this.renderNavRoutes()}</nav>
          <header className="App__header">
            <h1>
              <Link to="/">Noteful</Link>{' '}
              <FontAwesomeIcon icon="check-double" />
            </h1>
          </header>
          <main className="App__main">{this.renderMainRoutes()}</main>
        </div>
      </AppContext.Provider>
    );
  }
}

export default App;
