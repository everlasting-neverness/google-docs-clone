import React, { useCallback } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';


const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editorEl = document.createElement("div");
        wrapper.append(editorEl);
        new Quill(editorEl, { 
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS,
            }
        });
    }, []);

    return (
        <div className="container" ref={wrapperRef} />
    )
}
