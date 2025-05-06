import Highlight from "prism-react-renderer";
import nightOwl from "prism-react-renderer/themes/nightOwl";
import nightOwlLight from "prism-react-renderer/themes/nightOwlLight";
import Prism from "prism-react-renderer/prism"; // Import Prism core
import { useSelector } from "react-redux";

// // Map TinyMCE language classes to Prism.language keys
// const languageMap = {
//     javascript: "javascript",
//     html: "html",
//     css: "css",
//     php: "php",
//     ruby: "ruby",
//     python: "python",
//     java: "java",
//     c: "c",
//     csharp: "csharp",
//     cpp: "cpp",
// };

// // Force language loading
// Prism.languages.javascript = Prism.languages.javascript || {};
// Prism.languages.html = Prism.languages.html || {};
// Prism.languages.css = Prism.languages.css || {};
// // ... add all needed languages

/**
 * Highlights code blocks in blog content.
 * @param {Object} props
 * @param {string} props.code - The code string.
 * @param {string} [props.language="javascript"] - The language for highlighting.
 */
export default function CodeBlock({ code, language = "javascript" }) {
    const { theme } = useSelector((state) => state.ui);

    return (
        <Highlight
            code={code.trim()}
            language={language}
            theme={theme === `dark` ? nightOwl : nightOwlLight}
            Prism={Prism}
        >
            {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <pre
                    className={`${className} p-4 rounded-md bg-gray-800 text-gray-100 overflow-x-auto`}
                    style={style}
                >
                    <code>
                        {tokens.map((line, i) => {
                            const lineProps = getLineProps({ line });
                            const { key: _key, ...restProps } = lineProps; // Destructure key

                            return (
                                <div key={i} {...restProps}>
                                    {line.map((token, key) => {
                                        const tokenProps = getTokenProps({
                                            token,
                                        });
                                        return (
                                            <span
                                                key={key}
                                                {...{
                                                    className:
                                                        tokenProps.className,
                                                    style: tokenProps.style,
                                                    children:
                                                        tokenProps.children,
                                                }}
                                            />
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </code>
                </pre>
            )}
        </Highlight>
    );
}
