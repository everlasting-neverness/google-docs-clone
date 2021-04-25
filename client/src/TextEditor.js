import 'quill/dist/quill.snow.css';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Quill from 'quill';
import { io } from 'socket.io-client';


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

    const { id: docId } = useParams();
    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);

    useEffect(() => {
        const s = io('http://localhost:3001');
        setSocket(s);
        return () => {
            s.disconnect();
        }
    }, []);

    useEffect(() => {
        if (!quill || !socket) return;
        socket.once('load-document', document => {
            quill.setContents(document);
            quill.enable();
        });
        socket.emit('get-document', docId);
    }, [quill, socket, docId]);

    useEffect(() => {
        if (!quill || !socket) return;
        const interval = setInterval(() => {
            socket?.emit('save-document', quill.getContents());
        }, SAVE_INTERVAL_MS);

        return () => {
            clearInterval(interval);
        }
    }, [quill, socket]);

    useEffect(() => {
        if (!quill || !socket) return;
        const handleUpdate = (delta) => {
            quill.updateContents(delta);
        }
        socket.on('receive-changes', handleUpdate);
        return () => {
            socket.off('receive-changes', handleUpdate)
        }
    }, [quill, socket]);

    useEffect(() => {
        if (!quill || !socket) return;
        const handleTextChange = (delta, oldDelta, source) => {
            if (source !== 'user') return;
            socket.emit("send-changes", delta);
        }
        quill.on('text-change', handleTextChange);
        return () => {
            quill.off('text-change', handleTextChange)
        }
    }, [quill, socket]);

    const wrapperRef = useCallback((wrapper) => {
        if (wrapper == null) return;
        wrapper.innerHTML = "";
        const editorEl = document.createElement("div");
        wrapper.append(editorEl);
        const q = new Quill(editorEl, {
            theme: 'snow',
            modules: {
                toolbar: TOOLBAR_OPTIONS,
            }
        });
        q.disable();
        q.setText('Loading...');
        setQuill(q);
    }, []);

    return (
        <div className="container" ref={wrapperRef} />
    )
}
