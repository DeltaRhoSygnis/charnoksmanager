
import { useAuth } from '@/hooks/useAuth';
import { OwnerDashboard } from './OwnerDashboard';
import { WorkerDashboard } from './WorkerDashboard';

export const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null; // ProtectedRoute will handle redirect
  }

  return user.role === 'owner' ? <OwnerDashboard /> : <WorkerDashboard />;
};
