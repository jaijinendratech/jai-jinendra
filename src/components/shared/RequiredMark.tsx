/** Compulsory-field marker shown right after a required field's label text. */
export function RequiredMark() {
  return (
    <span className="text-red-600" aria-hidden>
      {" "}
      *
    </span>
  );
}
