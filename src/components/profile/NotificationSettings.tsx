
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';

type NotificationSettings = Tables<'user_notification_settings'>;

const NotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    id: '',
    user_id: user?.id || '',
    in_app_notifications: true,
    email_notifications: false,
    portfolio_updates: true,
    reminder_notifications: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_notification_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // If no settings exist yet, create default settings
        await createDefaultSettings();
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load notification settings."
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultSettings = async () => {
    if (!user?.id) return;
    
    try {
      const defaultSettings = {
        user_id: user.id,
        in_app_notifications: true,
        email_notifications: false,
        portfolio_updates: true,
        reminder_notifications: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_notification_settings')
        .insert(defaultSettings);

      if (error) throw error;

      setSettings({ ...defaultSettings, id: '' });
    } catch (error) {
      console.error('Error creating notification settings:', error);
    }
  };

  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    setSaving(true);
    try {
      const updatedSettings = { ...settings, [key]: value, updated_at: new Date().toISOString() };
      setSettings(updatedSettings);

      const { error } = await supabase
        .from('user_notification_settings')
        .upsert(updatedSettings);

      if (error) throw error;

      toast({
        title: "Settings updated",
        description: "Your notification preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update notification settings."
      });
      // Revert the change in UI
      setSettings(settings);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Manage how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Manage how you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="in-app">In-app Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications within the application
            </p>
          </div>
          <Switch
            id="in-app"
            checked={settings.in_app_notifications}
            onCheckedChange={(checked) => updateSetting('in_app_notifications', checked)}
            disabled={saving}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="email">Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications via email
            </p>
          </div>
          <Switch
            id="email"
            checked={settings.email_notifications}
            onCheckedChange={(checked) => updateSetting('email_notifications', checked)}
            disabled={saving}
          />
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-4">Notification Types</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="portfolio-updates">Portfolio Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about publishing and updating portfolios
                </p>
              </div>
              <Switch
                id="portfolio-updates"
                checked={settings.portfolio_updates}
                onCheckedChange={(checked) => updateSetting('portfolio_updates', checked)}
                disabled={saving || !settings.in_app_notifications}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reminders">Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Reminders to complete your profile and portfolio
                </p>
              </div>
              <Switch
                id="reminders"
                checked={settings.reminder_notifications}
                onCheckedChange={(checked) => updateSetting('reminder_notifications', checked)}
                disabled={saving || !settings.in_app_notifications}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
