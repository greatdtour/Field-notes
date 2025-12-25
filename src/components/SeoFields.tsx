"use client";

import { useEffect, useState } from "react";

type SeoFieldsProps = {
  excerpt?: string;
  metaTitle?: string;
  metaDesc?: string;
};

export function SeoFields({ excerpt = "", metaTitle = "", metaDesc = "" }: SeoFieldsProps) {
  const [localExcerpt, setLocalExcerpt] = useState(excerpt);
  const [localMetaTitle, setLocalMetaTitle] = useState(metaTitle);
  const [localMetaDesc, setLocalMetaDesc] = useState(metaDesc);

  useEffect(() => {
    setLocalExcerpt(excerpt);
    setLocalMetaTitle(metaTitle);
    setLocalMetaDesc(metaDesc);
  }, [excerpt, metaTitle, metaDesc]);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <input
          id="editor-excerpt"
          name="excerpt"
          value={localExcerpt}
          onChange={(event) => setLocalExcerpt(event.target.value)}
          placeholder="Short excerpt for previews"
          className="editor-input"
          data-autosave="excerpt"
        />
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Excerpt length: {localExcerpt.length} characters.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <input
            id="editor-meta-title"
            name="metaTitle"
            value={localMetaTitle}
            onChange={(event) => setLocalMetaTitle(event.target.value)}
            placeholder="SEO meta title"
            className="editor-input"
            data-autosave="metaTitle"
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Meta title: {localMetaTitle.length} / 60
          </p>
        </div>
        <div className="grid gap-2">
          <input
            id="editor-meta-desc"
            name="metaDesc"
            value={localMetaDesc}
            onChange={(event) => setLocalMetaDesc(event.target.value)}
            placeholder="SEO meta description"
            className="editor-input"
            data-autosave="metaDesc"
          />
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Meta description: {localMetaDesc.length} / 160
          </p>
        </div>
      </div>
    </div>
  );
}
