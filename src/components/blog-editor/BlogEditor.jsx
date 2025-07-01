import { useRef, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useSelector } from "react-redux";
import { Controller } from "react-hook-form";

// Import TinyMCE core and plugins
import "tinymce/tinymce";
import "tinymce/icons/default";
import "tinymce/themes/silver";
import "tinymce/plugins/advlist";
import "tinymce/plugins/autolink";
import "tinymce/plugins/lists";
import "tinymce/plugins/link";
import "tinymce/plugins/image";
import "tinymce/plugins/charmap";
import "tinymce/plugins/preview";
import "tinymce/plugins/anchor";
import "tinymce/plugins/searchreplace";
import "tinymce/plugins/visualblocks";
import "tinymce/plugins/code";
import "tinymce/plugins/codesample";
import "tinymce/plugins/fullscreen";
import "tinymce/plugins/insertdatetime";
import "tinymce/plugins/media";
import "tinymce/plugins/table";
import "tinymce/plugins/help";
import "tinymce/plugins/wordcount";
// Import skins
import "tinymce/skins/ui/oxide/skin.min.css";

// import "tinymce/skins/ui/oxide/content.min.css";
// import "tinymce/skins/content/default/content.min.css";

export default function BlogEditor({ name = `content`, control, ...props }) {
    const editorRef = useRef(null);
    const { theme } = useSelector((state) => state.ui);

    // Cleanup and reinitialize editor on theme change
    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.remove(); // Destroy existing editor
            editorRef.current = null; // Reset ref
        }
    }, [theme]);

    return (
        <div>
            <Controller
                name={name || "content"}
                control={control}
                render={({ field: { onChange, value } }) => (
                    <Editor
                        onInit={(_evt, editor) => (editorRef.current = editor)}
                        key={theme}
                        value={value}
                        onEditorChange={(newContent) => {
                            onChange(newContent); // Update form state
                            // dispatch(setContent(newContent)); // Update Redux state
                        }}
                        {...props}
                        init={{
                            height: 300,
                            menubar: true,
                            branding: false,
                            promotion: false,
                            placeholder: `Write your content here...`,
                            codesample_languages: [
                                { text: "JavaScript", value: "javascript" },
                                { text: "HTML/XML", value: "html" },
                                { text: "CSS", value: "css" },
                                { text: "PHP", value: "php" },
                                { text: "Ruby", value: "ruby" },
                                { text: "Python", value: "python" },
                                { text: "Java", value: "java" },
                                { text: "C", value: "c" },
                                { text: "C#", value: "csharp" },
                                { text: "C++", value: "cpp" },
                            ],
                            forced_root_block: "div",
                            plugins: [
                                "advlist",
                                "autolink",
                                "lists",
                                "link",
                                "image",
                                "charmap",
                                "preview",
                                "anchor",
                                "searchreplace",
                                "visualblocks",
                                "code",
                                "fullscreen",
                                "insertdatetime",
                                "media",
                                "table",
                                "help",
                                "wordcount",
                                "codesample",
                            ],
                            toolbar:
                                "undo redo | formatselect | bold italic backcolor | codesample code " +
                                "alignleft aligncenter alignright alignjustify | " +
                                "bullist numlist outdent indent | link image table | removeformat | help",
                            content_style: `
                                    body {
                                        font-family: Helvetica, Arial, sans-serif;
                                        font-size: 14px;
                                        padding:10px;
                                        margin: 0;
                                        line-height: 1.4;
                                    }
                                    table {
                                        border-collapse: collapse;
                                    }
                                    table:not([cellpadding]) td,
                                    table:not([cellpadding]) th {
                                        padding: 0.4rem;
                                    }
                                    table[border]:not([border="0"]):not([style*="border-width"]) td,
                                    table[border]:not([border="0"]):not([style*="border-width"]) th {
                                        border-width: 1px;
                                    }
                                    table[border]:not([border="0"]):not([style*="border-style"]) td,
                                    table[border]:not([border="0"]):not([style*="border-style"]) th {
                                        border-style: solid;
                                    }
                                    table[border]:not([border="0"]):not([style*="border-color"]) td,
                                    table[border]:not([border="0"]):not([style*="border-color"]) th {
                                        border-color: #ccc;
                                    }
                                    figure {
                                        display: table;
                                        margin: 1rem auto;
                                    }
                                    figure figcaption {
                                        color: #999;
                                        display: block;
                                        margin-top: 0.25rem;
                                        text-align: center;
                                    }
                                    hr {
                                        border-color: #ccc;
                                        border-style: solid;
                                        border-width: 1px 0 0 0;
                                    }
                                    code {
                                        background-color: #35302a;
                                        color: #faca81;
                                        border-radius: 3px;
                                        padding: 0.1rem 0.2rem;
                                        user-select : text;
                                    }
                                    [data-mce-selected="inline-boundary"] {
                                        background-color: #35302a !important;
                                        color: #faca81 !important;
                                        outline: none !important;
                                    }    
                                    .mce-content-body:not([dir="rtl"]) blockquote {
                                        border-left: 2px solid #ccc;
                                        margin-left: 1.5rem;
                                        padding-left: 1rem;
                                    }
                                    .mce-content-body[data-mce-placeholder]:not(.mce-visualblocks)::before {
                                        padding-left: 0.8rem;
                                        padding-top: 0rem;
                                        color : ${
                                            theme === "dark"
                                                ? "#fff"
                                                : "#343434"
                                        }
                                    }
                                    .mce-content-body[dir="rtl"] blockquote {
                                        border-right: 2px solid #ccc;
                                        margin-right: 1.5rem;
                                        padding-right: 1rem;
                                    }
                                `,
                            license_key: "gpl",
                            skin: `${
                                theme === "dark" ? "oxide-dark" : "oxide"
                            }`,
                            content_css: `${
                                theme === "dark" ? "dark" : "default"
                            }`,
                            base_url: "/tinymce",
                            suffix: ".min",
                        }}
                    />
                )}
            />
        </div>
    );
}
