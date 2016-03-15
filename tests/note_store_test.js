/*
Test Plan for NoteStore
In order to cover NoteStore, we should assert the following facts:
• Does it create notes correctly?
• Does it allow editing notes correctly?
• Does it allow deleting notes by id?
• Does it allow filtering notes by a given array of ids?
*/

import assert from 'assert';
import NoteActions from 'app/actions/NoteActions';
import NoteStore from 'app/stores/NoteStore';
import alt from 'app/libs/alt';

describe('NoteStore', () => {
  //  flush the contents of Alt store before each test
  beforeEach(() => {
      alt.flush();
  });

  it('creates notes', () => {
    const task = 'test';

    NoteActions.create({task});

    const state = NoteStore.getState();

    assert.equal(state.notes.length, 1);
    assert.equal(state.notes[0].task, task);
  });

  it('updates notes', () => {
    const task = 'test';
    const updatedTask = 'test 2';

    NoteActions.create({task});

    const note = NoteStore.getState().notes[0];

    NoteActions.update({...note, task: updatedTask});

    const state = NoteStore.getState();

    assert.equal(state.notes.length, 1);
    assert.equal(state.notes[0].task, updatedTask);
  });

  it('deletes notes', () => {
    NoteActions.create({task: 'test'});

    const note = NoteStore.getState().notes[0];

    NoteActions.delete(note.id);

    const state = NoteStore.getState();

    assert.equal(state.notes.length, 0);
  });

  it('gets notes', () => {
    const task = 'test';
    NoteActions.create({task: task});

    const note = NoteStore.getState().notes[0];
    const notes = NoteStore.getNotesByIds([note.id]);

    assert.equal(notes.length, 1);
    assert.equal(notes[0].task, task);
  });
});
