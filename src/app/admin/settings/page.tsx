'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Bell, Send } from 'lucide-react';

export default function SettingsPage() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);

    const supabase = createClient();

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !message.trim()) {
            alert('Please enter both title and message');
            return;
        }

        if (!confirm('Are you sure you want to send this notification to all users?')) {
            return;
        }

        setSending(true);
        try {
            // Get all users
            const { data: users, error: usersError } = await supabase
                .from('user_profiles')
                .select('id');

            if (usersError) throw usersError;

            if (!users || users.length === 0) {
                alert('No users found');
                return;
            }

            // Create notifications for all users
            const notifications = users.map((user) => ({
                user_id: user.id,
                title,
                message,
                type: 'system',
                data: { is_announcement: true },
            }));

            const { error: notifError } = await supabase
                .from('notifications')
                .insert(notifications);

            if (notifError) throw notifError;

            alert(`Broadcast sent successfully to ${users.length} users!`);
            setTitle('');
            setMessage('');
        } catch (error) {
            console.error('Error sending broadcast:', error);
            alert('Failed to send broadcast notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Admin Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Broadcast Notifications */}
                <div className="admin-card">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-6 h-6 text-primary" />
                        <h2 className="text-xl font-bold">Broadcast Notification</h2>
                    </div>
                    <p className="text-text-secondary mb-4">
                        Send a notification to all users on the platform.
                    </p>

                    <form onSubmit={handleSendBroadcast} className="space-y-4">
                        <div>
                            <label className="admin-label">Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g., New Feature Announcement"
                                className="admin-input"
                                maxLength={100}
                            />
                        </div>

                        <div>
                            <label className="admin-label">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Enter your message here..."
                                className="admin-input"
                                rows={5}
                                maxLength={500}
                            />
                            <p className="text-sm text-text-secondary mt-1">
                                {message.length}/500 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={sending || !title.trim() || !message.trim()}
                            className="admin-btn admin-btn-primary w-full"
                        >
                            {sending ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send Broadcast
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Platform Statistics */}
                <div className="admin-card">
                    <h2 className="text-xl font-bold mb-4">Platform Information</h2>
                    <div className="space-y-4">
                        <div className="p-4 bg-background rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Platform</p>
                            <p className="text-lg font-semibold">AgriServe Admin Panel</p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Version</p>
                            <p className="text-lg font-semibold">1.0.0</p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Environment</p>
                            <p className="text-lg font-semibold">Production</p>
                        </div>
                        <div className="p-4 bg-background rounded-lg">
                            <p className="text-sm text-text-secondary mb-1">Database</p>
                            <p className="text-lg font-semibold">Supabase (Live)</p>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="admin-card lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <a
                            href="/admin/users"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">Manage Users</h3>
                            <p className="text-sm text-text-secondary">
                                View, edit, and manage user accounts
                            </p>
                        </a>
                        <a
                            href="/admin/equipment"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">Manage Equipment</h3>
                            <p className="text-sm text-text-secondary">
                                View and manage equipment listings
                            </p>
                        </a>
                        <a
                            href="/admin/bookings"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">Manage Bookings</h3>
                            <p className="text-sm text-text-secondary">
                                View and update booking statuses
                            </p>
                        </a>
                        <a
                            href="/admin/labour"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">Manage Labour</h3>
                            <p className="text-sm text-text-secondary">
                                View and verify labour profiles
                            </p>
                        </a>
                        <a
                            href="/admin/reviews"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">Moderate Reviews</h3>
                            <p className="text-sm text-text-secondary">
                                Review and moderate user reviews
                            </p>
                        </a>
                        <a
                            href="/admin/payments"
                            className="p-4 border border-border rounded-lg hover:bg-background transition-colors"
                        >
                            <h3 className="font-semibold mb-2">View Payments</h3>
                            <p className="text-sm text-text-secondary">
                                Track payments and revenue
                            </p>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
