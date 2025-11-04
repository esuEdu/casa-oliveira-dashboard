import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, Users, FolderTree, TrendingUp } from 'lucide-react';
import api from '@/lib/api';

interface Stats {
  products: number;
  users: number;
  categories: number;
  orders: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ products: 0, users: 0, categories: 0, orders: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/store/overview');
      
      setStats({
        products: response.data.products || 0,
        users: response.data.users || 0,
        categories: response.data.categories || 0,
        orders: 0,
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Products',
      value: stats.products,
      icon: Package,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Total Users',
      value: stats.users,
      icon: Users,
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Categories',
      value: stats.categories,
      icon: FolderTree,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsCards.map((stat, index) => (
            <Card
              key={stat.title}
              className="glass-card border-border/50 animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg bg-gradient-to-br ${stat.color} p-2.5`}>
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {loading ? (
                    <div className="h-8 w-20 animate-pulse rounded bg-muted" />
                  ) : (
                    stat.value
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Welcome Card */}
        <Card className="glass-card border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome to Casa Oliveira Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Manage your e-commerce store with this modern, glassmorphic admin dashboard. Navigate through products, categories, users, and more using the sidebar menu.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
