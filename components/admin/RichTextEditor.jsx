// components/RichTextEditor.js
"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useQuill } from "react-quilljs";
import Quill from "quill";
import ImageResize from "quill-image-resize-module-react";
import "quill/dist/quill.snow.css";

export default function RichTextEditor({ fieldName }) {
  const { setValue } = useFormContext();
  const [modules, setModules] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Quill.register("modules/imageResize", ImageResize);

      setModules({
        toolbar: {
          container: [
            ["bold", "italic", "underline", "strike"],
            [{ align: [] }],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ indent: "-1" }, { indent: "+1" }],
            [{ size: ["small", false, "large", "huge"] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            [{ color: [] }, { background: [] }],
            ["image"],
            ["clean"],
          ],
          handlers: {
            image: function () {
              const input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute("accept", "image/*");
              input.click();

              input.onchange = async () => {
                const file = input.files[0];
                if (!file) return;

                const formData = new FormData();
                formData.append("images", file);

                try {
                  const res = await fetch(
                    `${process.env.NEXT_PUBLIC_BASE_URL}/api/upload`,
                    {
                      method: "POST",
                      body: formData,
                    }
                  );
                  const data = await res.json();
                  if (data.success) {
                    const imageUrl = data.imageUrls[0];
                    const range = this.quill.getSelection();
                    this.quill.insertEmbed(range.index, "image", imageUrl);
                  }
                } catch (err) {
                  console.error("Upload error:", err);
                }
              };
            },
          },
        },
        clipboard: { matchVisual: false },
        imageResize: {
          modules: ["Resize", "DisplaySize", "Toolbar"],
        },
      });
    }
  }, []);

  const { quill, quillRef } = useQuill({ modules });

  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        const html = quillRef.current?.firstChild?.innerHTML;
        setValue(fieldName, html || "");
      });
    }
  }, [quill]);

  return (
    <div className="quill-container">
      <div ref={quillRef} />
    </div>
  );
}
