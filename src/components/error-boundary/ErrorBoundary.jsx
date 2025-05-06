import { Component } from "react";

// Classic Class based Error Boundary for errors outside routes i.e. App.
export default class ErrorBoundary extends Component {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // Log error to a service (e.g., Sentry) or console
        console.error("Caught by global ErrorBoundary:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 ">
                    <div className="flex flex-col justify-center items-center animate-fade-in">
                        <h1 className="text-4xl font-bold mb-6">
                            Something went wrong!
                        </h1>
                        <p className="px-4 mb-6 text-lg text-red-500 dark:text-red-400">
                            {this.state.error?.message || "Unknown error"}
                        </p>
                        <div className="flex justify-center items-center gap-12">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:bg-blue-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-500 cursor-pointer"
                            >
                                Reload Page
                            </button>
                            <button
                                onClick={() => {
                                    this.setState({
                                        hasError: false,
                                        error: null,
                                    });
                                    window.location.assign("/");
                                }}
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
                            >
                                Go To Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
