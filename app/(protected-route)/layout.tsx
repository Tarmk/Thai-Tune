import Footer from "@/layouts/main/footer";
import Header from "@/layouts/main/header";
import { AuthGuardProvider } from "@/providers/auth-guard-provider";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuardProvider>
      <Header collapsible />
      {children}
      <Footer />
    </AuthGuardProvider>
  );
};

export default MainLayout;
