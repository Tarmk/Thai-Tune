import Footer from "@/layouts/main/footer";
import Header from "@/layouts/main/header";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Header collapsible />
      {children}
      <Footer />
    </>
  );
};

export default MainLayout;
