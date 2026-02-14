import React, { useEffect, useState } from 'react';
import { User, Bot, Zap, Briefcase, Calendar, BadgeCheck } from 'lucide-react';
import { client } from '../api/client';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface UserProfile {
    id: string;
    email: string;
    name: string;
    avatar_style: string;
    bio: string;
    joined_at: string;
    stats: {
        total_xp: number;
        level: number;
        title: string;
        lessons_completed: number;
        current_streak: number;
    };
}

const AVATARS = [
    { id: 'default', icon: <User className="w-full h-full p-6 text-blue-600" />, label: 'Classic' },
    { id: 'robot', icon: <Bot className="w-full h-full p-6 text-gray-600" />, label: 'Robo-Advisor' },
    { id: 'wizard', icon: <Zap className="w-full h-full p-6 text-purple-600" />, label: 'Crypto Wizard' },
    { id: 'investor', icon: <Briefcase className="w-full h-full p-6 text-green-600" />, label: 'Tycoon' },
];

export const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [avatar, setAvatar] = useState('default');
    const [bio, setBio] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await client.get('/social/me');
            setProfile(res.data);
            setAvatar(res.data.avatar_style || 'default');
            setBio(res.data.bio || '');
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    };

    const handleSave = async () => {
        try {
            await client.patch('/social/me', {
                avatar_style: avatar,
                bio
            });
            setIsEditing(false);
            fetchProfile();
        } catch (error) {
            console.error('Failed to update profile:', error);
        }
    };

    if (!profile) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

    const currentAvatar = AVATARS.find(a => a.id === profile.avatar_style) || AVATARS[0];

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-12">
            {/* Header / Cover */}
            <div className="relative h-48 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 overflow-hidden mb-16">
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                {/* Avatar positioning */}
                <div className="absolute -bottom-12 left-8 flex items-end">
                    <div className="w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg flex items-center justify-center relative z-10 overflow-hidden">
                        {currentAvatar.icon}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {/* Left Column: Info & Edit */}
                <div className="md:col-span-1 space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{profile.name}</h1>
                        <p className="text-blue-600 font-medium flex items-center gap-1">
                            <BadgeCheck className="w-4 h-4" /> {profile.stats.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Joined {new Date(profile.joined_at).toLocaleDateString()}
                        </p>
                    </div>

                    {!isEditing ? (
                        <>
                            <Card className="!p-5 bg-gray-50">
                                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">About</h3>
                                <p className="text-gray-700 italic">
                                    {profile.bio || "No bio yet. Add one to tell your story!"}
                                </p>
                            </Card>
                            <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full">
                                Edit Profile
                            </Button>
                        </>
                    ) : (
                        <Card className="!p-5 border-blue-200 shadow-md">
                            <h3 className="font-bold text-gray-900 mb-3">Edit Profile</h3>

                            <label className="block text-xs font-bold text-gray-500 mb-1">Avatar</label>
                            <div className="flex gap-2 mb-4">
                                {AVATARS.map(a => (
                                    <button
                                        key={a.id}
                                        onClick={() => setAvatar(a.id)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all border-2
                                            ${avatar === a.id ? 'border-blue-500 bg-blue-50 scale-110' : 'border-gray-200 hover:bg-gray-100'}`}
                                        title={a.label}
                                    >
                                        <div className="w-8 h-8 pointer-events-none">
                                            {a.icon}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <label className="block text-xs font-bold text-gray-500 mb-1">Bio</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[100px] mb-4"
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                                placeholder="Tell us about your financial goals..."
                            />

                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="flex-1">Save</Button>
                                <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">Cancel</Button>
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column: Stats & Achievements */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="!p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{profile.stats.total_xp}</div>
                            <div className="text-xs text-gray-500 uppercase">Total XP</div>
                        </Card>
                        <Card className="!p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">{profile.stats.lessons_completed}</div>
                            <div className="text-xs text-gray-500 uppercase">Lessons</div>
                        </Card>
                        <Card className="!p-4 text-center">
                            <div className="text-2xl font-bold text-gray-900">🔥 {profile.stats.current_streak}</div>
                            <div className="text-xs text-gray-500 uppercase">Day Streak</div>
                        </Card>
                    </div>

                    <Card className="!p-6">
                        <h2 className="font-bold text-gray-900 mb-4">Badges & Titles</h2>
                        <div className="flex flex-wrap gap-3">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">Early Adopter</span>
                            <span className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-sm font-medium">{profile.stats.title}</span>
                            {profile.stats.lessons_completed >= 10 && (
                                <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">Fast Learner</span>
                            )}
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-400 text-sm border border-dashed border-gray-300">More coming soon...</span>
                        </div>
                    </Card>

                    {/* Placeholder for social feed or recent activity */}
                    <Card className="!p-6 opacity-70">
                        <h2 className="font-bold text-gray-900 mb-2">Friend Activity</h2>
                        <p className="text-gray-500 text-sm">Connect with friends to see their progress here. (Coming in Wave E)</p>
                    </Card>
                </div>
            </div>
        </div>
    );
};
