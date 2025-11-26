import MonacoEditor from '@monaco-editor/react';
import React, { useRef } from 'react';
import { useSettings } from '../../contexts/SettingsContext';

interface EditorProps {
    content: string;
    onChange: (content: string) => void;
    readOnly?: boolean;
}

export const Editor: React.FC<EditorProps> = ({ content, onChange, readOnly = false }) => {
    const { settings } = useSettings();
    const editorRef = useRef(null);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
    };

    const handleEditorChange = (value: string | undefined) => {
        if (value !== undefined) {
            onChange(value);
        }
    };

    // Determine theme based on settings
    const editorTheme = settings.theme === 'dark' ||
        (settings.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
        ? 'vs-dark'
        : 'vs';

    return (
        <div className="editor-area h-full w-full">
            <MonacoEditor
                height="100%"
                defaultLanguage="plaintext"
                value={content}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={editorTheme}
                options={{
                    readOnly,
                    fontSize: settings.fontSize,
                    fontFamily: settings.fontFamily,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    automaticLayout: true,
                    tabSize: 2,
                    insertSpaces: true,
                    scrollbar: {
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
            />
        </div>
    );
};
