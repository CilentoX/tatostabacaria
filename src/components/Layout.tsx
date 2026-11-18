import { Outlet } from 'react-router-dom';
import { Navbar, Footer, InstagramBubble } from './index';

export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />
      <Outlet />
      <Footer />
      <InstagramBubble />
    </div>
  );
}