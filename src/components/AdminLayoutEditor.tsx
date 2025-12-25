"use client";

import { useState } from "react";

type Section = {
  id: string;
  page: string;
  type: string;
  title: string | null;
  body: string | null;
  order: number;
  visible: boolean;
};

type AdminLayoutEditorProps = {
  initialSections: Section[];
};

export function AdminLayoutEditor({ initialSections }: AdminLayoutEditorProps) {
  const [sections, setSections] = useState<Section[]>([...initialSections]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");

  function moveSection(fromId: string, toId: string) {
    const fromIndex = sections.findIndex((section) => section.id === fromId);
    const toIndex = sections.findIndex((section) => section.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;

    const next = [...sections];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setSections(next.map((section, index) => ({ ...section, order: index })));
  }

  async function saveChanges() {
    setMessage("");
    const response = await fetch("/api/admin/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });

    if (!response.ok) {
      const data = await response.json();
      setMessage(data.error || "Failed to save");
      return;
    }

    setMessage("Layout saved");
  }

  function addSection() {
    const id = `home-custom-${Date.now()}`;
    setSections((current) => [
      ...current,
      {
        id,
        page: "home",
        type: "custom",
        title: "New Section",
        body: "",
        order: current.length,
        visible: true,
      },
    ]);
  }

  return (
    <div className="grid gap-4">
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Drag to reorder sections. Edit titles and body copy inline.
      </p>
      {sections.map((section) => (
        <div
          key={section.id}
          draggable
          onDragStart={() => setDragId(section.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => {
            if (dragId && dragId !== section.id) {
              moveSection(dragId, section.id);
            }
            setDragId(null);
          }}
          className="border rounded-2xl p-4"
          style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-white)' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <input
                value={section.type}
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item) =>
                      item.id === section.id ? { ...item, type: event.target.value } : item
                    )
                  )
                }
                className="text-xs uppercase tracking-[0.3em] border border-transparent bg-transparent"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                value={section.title ?? ""}
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item) =>
                      item.id === section.id ? { ...item, title: event.target.value } : item
                    )
                  )
                }
                className="mt-2 w-full border rounded-lg px-3 py-2"
                style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-gray-50)', color: 'var(--text-primary)' }}
                placeholder="Section title"
              />
            </div>
            <label className="flex items-center gap-2 text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
              <input
                type="checkbox"
                checked={section.visible}
                onChange={(event) =>
                  setSections((current) =>
                    current.map((item) =>
                      item.id === section.id ? { ...item, visible: event.target.checked } : item
                    )
                  )
                }
              />
              Visible
            </label>
          </div>
          <textarea
            value={section.body ?? ""}
            onChange={(event) =>
              setSections((current) =>
                current.map((item) =>
                  item.id === section.id ? { ...item, body: event.target.value } : item
                )
              )
            }
            className="mt-4 w-full border rounded-lg px-3 py-2 min-h-[120px]"
            style={{ borderColor: 'var(--border-gray)', background: 'var(--bg-gray-50)', color: 'var(--text-primary)' }}
            placeholder="Section body"
          />
        </div>
      ))}
      <button
        onClick={saveChanges}
        className="text-white px-4 py-3 rounded-lg text-sm font-semibold"
        style={{ background: 'var(--accent)' }}
      >
        Save Layout
      </button>
      <button
        onClick={addSection}
        className="border px-4 py-3 rounded-lg text-sm font-semibold"
        style={{ borderColor: 'var(--border-gray)', color: 'var(--text-primary)', background: 'var(--bg-white)' }}
      >
        Add Section
      </button>
      {message ? <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p> : null}
    </div>
  );
}
