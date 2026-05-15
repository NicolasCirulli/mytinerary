import { SEO } from '@shared/seo/SEO';
import { AdminDashboard } from '../profile/components/AdminDashboard';

const AdminPage = () => {
  return (
    <>
      <SEO
        title="Admin Control Center"
        description="Exclusive portal for managing cities and itineraries."
      />
      <div className="min-h-[calc(100vh-4rem)] bg-background text-foreground">
        <AdminDashboard />
      </div>
    </>
  );
};

export default AdminPage;