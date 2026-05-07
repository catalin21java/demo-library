import { useState } from "react";

import useBooksCache from "../hooks/useBooksCache";

const EMPTY_FORM = { title: "", author: "", publishedYear: "" };

export default function BookCreateForm({ onError }) {
  const { createBook } = useBooksCache();
  const [form, setForm] = useState(EMPTY_FORM);
  const [isCreating, setIsCreating] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    onError?.("");
    setIsCreating(true);
    try {
      await createBook(form);
      setForm(EMPTY_FORM);
    } catch (error) {
      onError?.(error.message || "Failed to create book.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        value={form.title}
        onChange={(event) => updateField("title", event.target.value)}
        placeholder="Title"
      />
      <input
        value={form.author}
        onChange={(event) => updateField("author", event.target.value)}
        placeholder="Author"
      />
      <input
        value={form.publishedYear}
        onChange={(event) => updateField("publishedYear", event.target.value)}
        placeholder="Published year"
      />
      <button type="submit" disabled={isCreating}>
        {isCreating ? "Creating..." : "Create"}
      </button>
    </form>
  );
}
