'use client';

import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

export default function RichTextEditor({ value, onChange, placeholder = '' }) {
  return (
    <div className="prose max-w-none">
      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={{
          placeholder: placeholder,
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|',
            'undo', 'redo'
          ]
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          if (onChange) {
            onChange(data);
          }
        }}
      />
      <style jsx global>{`
        .ck-editor__editable_inline {
          min-height: 200px;
        }
      `}</style>
    </div>
  );
}
