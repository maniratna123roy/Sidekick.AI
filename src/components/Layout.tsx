import { ReactNode } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import AnimatedGridBackground from './AnimatedGridBackground';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen relative">
      <AnimatedGridBackground />
      <Navbar />
      <main className="relative z-10 pt-24">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
