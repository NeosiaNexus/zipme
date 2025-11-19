
import DownloadFileCard from "./_components/DownloadFileCard";
import SendFileCard from "./_components/SendFileCard";


export default async function Home() {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <div className="w-full flex gap-4 justify-center items-center">
        <SendFileCard />
        <div className="w-full max-w-sm">
          <DownloadFileCard senderEmail="test@test.com" fileName="test.pdf" message="test message" fileUrl="https://www.google.com" />
        </div>
      </div>
    </div>
  );
}
