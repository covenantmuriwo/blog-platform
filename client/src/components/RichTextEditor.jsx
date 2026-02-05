// client/src/components/RichTextEditor.jsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useCallback, useRef } from 'react';

export default function RichTextEditor({ value, onChange, placeholder = "Write your post content..." }) {
  const editorRef = useRef(null);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-gray max-w-none min-h-[200px] focus:outline-none p-4 tiptap'
      }
    },
    // Add selection update handler
    onSelectionUpdate: () => {
      // Force re-render when selection changes
      if (editorRef.current) {
        editorRef.current = editor;
      }
    },
    onFocus: ({ editor }) => {
      // Force update toolbar when focused
      editor.view.dispatch(editor.view.state.tr);
    }
  });

  editorRef.current = editor;

  // Update editor content when value changes from outside
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Improved button handlers
  const toggleBold = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBold().run();
      // Force immediate update
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  const toggleItalic = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleItalic().run();
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  const toggleHeading = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  const toggleBulletList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBulletList().run();
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  const toggleOrderedList = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleOrderedList().run();
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  const toggleBlockquote = useCallback(() => {
    if (editor) {
      editor.chain().focus().toggleBlockquote().run();
      setTimeout(() => editor.view.dispatch(editor.view.state.tr), 0);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 rounded-lg bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={toggleBold}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Bold"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4v12l-4-2-4 2V4l4-2 4 2z" />
          </svg>
        </button>
        
        <button
          type="button"
          onClick={toggleItalic}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Italic"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4h2a2 2 0 012 2v12a2 2 0 01-2 2h-2M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h2" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleHeading}
          className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Heading 2"
        >
          <span className="text-sm font-bold">H2</span>
        </button>

        <button
          type="button"
          onClick={toggleBulletList}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Bullet List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleOrderedList}
          className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Numbered List"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </button>

        <button
          type="button"
          onClick={toggleBlockquote}
          className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200'}`}
          title="Blockquote"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.5a2.5 2.5 0 000-5H9v5zm4 0h1.5a2.5 2.5 0 000-5H13v5z" />
          </svg>
        </button>
      </div>
      
      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
}