import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import api from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role?: string;
  status?: string;
  favorites?: string[];
  createdAt?: string;
}

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout title="Users">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-muted/50 border-border/50"
          />
        </div>

        {/* Users Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="glass-card border-border/50">
                <CardContent className="pt-6">
                  <div className="h-16 w-16 animate-pulse rounded-full bg-muted mx-auto" />
                  <div className="mt-4 h-4 w-32 animate-pulse rounded bg-muted mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground">
              No users found
            </div>
          ) : (
            filteredUsers.map((user, index) => (
              <Card
                key={user.id}
                className="glass-card border-border/50 animate-scale-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary-glow text-white text-lg">
                        {user.name?.split(' ').map((n) => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 font-semibold text-foreground">{user.name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-3 flex gap-2">
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {user.role || 'User'}
                      </Badge>
                      {user.status && (
                        <Badge variant="outline" className="border-success/20 bg-success/10 text-success">
                          {user.status}
                        </Badge>
                      )}
                    </div>
                    {user.createdAt && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Users;
