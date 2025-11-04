import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Collaborators = () => {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'collaborator',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/admin/collaborators', {
        name: formData.name,
        email: formData.email,
        phone: '+351900000000',
      });
      setResult(response.data);
      toast.success('Collaborator created successfully');
      setFormData({ email: '', name: '', role: 'collaborator' });
    } catch (error) {
      toast.error('Failed to create collaborator');
    }
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setFormData({ email: '', name: '', role: 'collaborator' });
  };

  return (
    <DashboardLayout title="Collaborators">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            Create new collaborator accounts with temporary passwords
          </p>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                Add Collaborator
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card border-border/50">
              <DialogHeader>
                <DialogTitle>Create New Collaborator</DialogTitle>
              </DialogHeader>
              {!result ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-muted/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="bg-muted/50 border-border/50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) => setFormData({ ...formData, role: value })}
                    >
                      <SelectTrigger className="bg-muted/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collaborator">Collaborator</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" className="btn-primary">
                      Create
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <Card className="bg-success/10 border-success/20">
                    <CardHeader>
                      <CardTitle className="text-success">Collaborator Created!</CardTitle>
                      <CardDescription>
                        Share these credentials with the new collaborator
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div>
                        <p className="text-sm font-medium">Name:</p>
                        <p className="text-sm text-muted-foreground">{result.user?.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Email:</p>
                        <p className="text-sm text-muted-foreground">{result.user?.email}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Temporary Password:</p>
                        <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                          {result.temporaryPassword}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-4">
                        The collaborator will be required to change this password on first login.
                      </p>
                    </CardContent>
                  </Card>
                  <Button onClick={handleClose} className="w-full">
                    Close
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Card */}
        <Card className="glass-card border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle>About Collaborators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-muted-foreground">
            <p>
              Collaborators are team members who can access the admin dashboard with specific permissions.
            </p>
            <p>
              When you create a new collaborator, they'll receive a temporary password that must be changed on their first login.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Collaborators;
