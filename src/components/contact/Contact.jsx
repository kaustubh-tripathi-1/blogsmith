export default function Contact() {
    return (
        <div className="min-h-full mx-auto px-4 py-6 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg mb-4">
                We’d love to hear from you! Whether you have feedback,
                questions, or collaboration ideas, feel free to reach out.
            </p>
            <p className="text-lg mb-4">
                Email us at:{" "}
                <a
                    href="mailto:kt400@gmail.com"
                    className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 dark:focus:text-blue-300"
                >
                    kt400@gmail.com
                </a>
            </p>
            <p className="text-lg">
                Follow us on social media for updates and more:
            </p>
            <ul className="list-disc list-inside mt-2">
                <li>
                    <a
                        href="https://twitter.com/07_kaustubh"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 dark:focus:text-blue-300"
                    >
                        Twitter
                    </a>
                </li>
                <li>
                    <a
                        href="https://github.com/kaustubh-tripathi-1"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 dark:text-blue-400 hover:underline focus:underline focus:outline-none hover:text-blue-600 dark:hover:text-blue-300 focus:text-blue-600 dark:focus:text-blue-300"
                    >
                        GitHub
                    </a>
                </li>
            </ul>
        </div>
    );
}
