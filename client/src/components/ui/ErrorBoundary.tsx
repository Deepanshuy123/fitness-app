import React from "react";

interface ErrorBoundaryState {
    hasError: boolean;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
    constructor(props: React.PropsWithChildren<{}>) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(): ErrorBoundaryState {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="page-container flex items-center justify-center">
                    <p className="text-red-500">Oops! Something went wrong.</p>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
