import Navbar from "../components/Navbar";
import PDFUploader from "../components/PDFUploader";

export default function Dashboard() {
    return (
        <>
            <Navbar />
            <div className="pt-16">

                <PDFUploader />
            </div>
            
        </>
    );
}
