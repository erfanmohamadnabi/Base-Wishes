import AddNoteForm from "../components/AddNoteForm";

export default function AddNote() {
  return (
    <div className="container">
      <div className="hero" style={{ paddingBottom: 0 }}>
        <p className="eyebrow">New note</p>
        <h1>Record your notes.</h1>
      </div>
      <AddNoteForm />
    </div>
  );
}
