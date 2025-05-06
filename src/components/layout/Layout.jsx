import { Outlet } from "react-router";
import { Footer, Header, Modal } from "../componentsIndex";
import { useSelector } from "react-redux";

/**
 * Renders the main app layout with header, footer, and child routes.
 * @returns {JSX.Element} The layout structure with Outlet for child routes.
 */
export default function Layout() {
    const { isModalOpen, modalType, modalData } = useSelector(
        (state) => state.ui
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200">
                <Outlet />
            </main>
            {isModalOpen && (
                <Modal modalType={modalType} modalData={modalData} />
            )}
            <Footer />
        </div>
    );
}
