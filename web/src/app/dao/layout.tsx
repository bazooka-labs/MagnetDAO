import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export default function DaoLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-160px)]">{children}</main>
      <Footer />
    </>
  );
}
