import { useNavigate, useLocation } from 'react-router-dom';
import {
    MessageSquare,
    Share2,
    AlertCircle,
    FileText,
    LogOut,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    BarChart3,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SidebarProps {
    onSignOut: () => void;
    user: any;
}

const Sidebar = ({ onSignOut, user }: SidebarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/dashboard', color: 'text-primary' },
        { icon: MessageSquare, label: 'Sidekick Chat', path: '/dashboard/chat', color: 'text-blue-500' },
        { icon: Share2, label: 'Codebase Map', path: '/dashboard/map', color: 'text-purple-500' },
        { icon: BarChart3, label: 'Repo Analytics', path: '/dashboard/analytics', color: 'text-orange-400' },
        { icon: Activity, label: 'Logic Viz', path: '/dashboard/visualize', color: 'text-green-500' },
        { icon: AlertCircle, label: 'Error Explainer', path: '/dashboard/error', color: 'text-red-500' },
        { icon: FileText, label: 'Docs Hub', path: '/dashboard/docs', color: 'text-orange-500' },
    ];

    return (
        <div
            className={cn(
                "h-screen glass-panel border-r border-border/50 transition-all duration-300 flex flex-col z-50",
                collapsed ? "w-20" : "w-64"
            )}
        >
            {/* Logo Area */}
            <div className={cn("p-2 flex items-center", collapsed ? "justify-center" : "justify-start pl-4")}>
                <img
                    src="/logo.png"
                    alt="Sidekick.ai Logo"
                    className={cn(
                        "h-24 w-auto transition-all duration-300",
                        collapsed ? "w-12 object-cover object-left" : ""
                    )}
                />
            </div>

            {/* Profile Section */}
            <div className={cn("px-4 mb-8", collapsed ? "text-center" : "")}>
                <div className={cn(
                    "bg-muted/30 rounded-xl p-3 border border-border/50 flex items-center gap-3",
                    collapsed ? "justify-center" : ""
                )}>
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                        {user?.email?.[0].toUpperCase()}
                    </div>
                    {!collapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.user_metadata?.full_name || 'User'}</p>
                            <p className="text-[10px] text-muted-foreground font-mono truncate">{user?.email}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2">
                {menuItems.map((item) => (
                    <Button
                        key={item.path}
                        variant="ghost"
                        onClick={() => navigate(item.path)}
                        className={cn(
                            "w-full justify-start gap-4 h-11 px-3 rounded-xl transition-all",
                            location.pathname === item.path ? "bg-primary/10 text-primary border border-primary/20" : "hover:bg-muted/50",
                            collapsed ? "justify-center px-0" : ""
                        )}
                    >
                        <item.icon className={cn("w-5 h-5", item.color)} />
                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </Button>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-4 space-y-2">
                <Button
                    variant="ghost"
                    onClick={() => setCollapsed(!collapsed)}
                    className={cn("w-full justify-start gap-4 px-3", collapsed ? "justify-center" : "")}
                >
                    {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                    {!collapsed && <span className="text-sm font-medium">Collapse</span>}
                </Button>

                <Button
                    variant="ghost"
                    onClick={onSignOut}
                    className={cn("w-full justify-start gap-4 px-3 text-destructive hover:text-destructive hover:bg-destructive/10", collapsed ? "justify-center" : "")}
                >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span className="text-sm font-medium">Log Out</span>}
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
