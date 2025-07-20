import React, { useState, useEffect } from 'react';
import { User, Mail, Globe, Target, Edit3, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface UserProfile {
  name: string;
  email: string;
  currency: string;
  experienceLevel: string;
  investmentGoal: string;
  language: string;
}

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    currency: 'USD',
    experienceLevel: 'beginner',
    investmentGoal: 'growth',
    language: 'en'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(profile);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      const parsedProfile = JSON.parse(savedProfile);
      setProfile(parsedProfile);
      setTempProfile(parsedProfile);
    }
  }, []);

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('userProfile', JSON.stringify(tempProfile));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setIsEditing(false);
  };

  const experienceLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const investmentGoals = [
    { value: 'growth', label: 'Long-term Growth' },
    { value: 'income', label: 'Regular Income' },
    { value: 'speculation', label: 'Short-term Trading' },
    { value: 'diversification', label: 'Portfolio Diversification' }
  ];

  const currencies = [
    { value: 'USD', label: 'US Dollar (USD)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'GBP', label: 'British Pound (GBP)' },
    { value: 'JPY', label: 'Japanese Yen (JPY)' }
  ];

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' },
    { value: 'de', label: 'German' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold neon-text">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline" className="border-primary/50 hover:border-primary">
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={handleCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="gradient-primary" size="sm">
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <Card className="glass-card p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center text-center">
            <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center mb-4 animate-pulse-glow">
              <User className="w-16 h-16 text-primary-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground">
              {profile.name || 'Anonymous User'}
            </h3>
            <p className="text-muted-foreground">{profile.email}</p>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={tempProfile.name}
                    onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                    placeholder="Enter your full name"
                    className="bg-muted/20 border-border/50"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {profile.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    type="email"
                    value={tempProfile.email}
                    onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})}
                    placeholder="Enter your email"
                    className="bg-muted/20 border-border/50"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {profile.email || 'Not set'}
                  </div>
                )}
              </div>

              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-foreground">Preferred Currency</Label>
                {isEditing ? (
                  <Select value={tempProfile.currency} onValueChange={(value) => setTempProfile({...tempProfile, currency: value})}>
                    <SelectTrigger className="bg-muted/20 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.value} value={currency.value}>
                          {currency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {currencies.find(c => c.value === profile.currency)?.label}
                  </div>
                )}
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <Label className="text-foreground">Experience Level</Label>
                {isEditing ? (
                  <Select value={tempProfile.experienceLevel} onValueChange={(value) => setTempProfile({...tempProfile, experienceLevel: value})}>
                    <SelectTrigger className="bg-muted/20 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {experienceLevels.find(l => l.value === profile.experienceLevel)?.label}
                  </div>
                )}
              </div>

              {/* Investment Goal */}
              <div className="space-y-2">
                <Label className="text-foreground">Investment Goal</Label>
                {isEditing ? (
                  <Select value={tempProfile.investmentGoal} onValueChange={(value) => setTempProfile({...tempProfile, investmentGoal: value})}>
                    <SelectTrigger className="bg-muted/20 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {investmentGoals.map((goal) => (
                        <SelectItem key={goal.value} value={goal.value}>
                          {goal.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {investmentGoals.find(g => g.value === profile.investmentGoal)?.label}
                  </div>
                )}
              </div>

              {/* Language */}
              <div className="space-y-2">
                <Label className="text-foreground">Language</Label>
                {isEditing ? (
                  <Select value={tempProfile.language} onValueChange={(value) => setTempProfile({...tempProfile, language: value})}>
                    <SelectTrigger className="bg-muted/20 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="p-3 rounded-lg bg-muted/20 border border-border/50 text-foreground">
                    {languages.find(l => l.value === profile.language)?.label}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card p-6 text-center hover-glow">
          <Mail className="w-8 h-8 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Contact Verified</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.email ? 'Email address set' : 'Email not configured'}
          </p>
        </Card>

        <Card className="glass-card p-6 text-center hover-glow">
          <Globe className="w-8 h-8 text-secondary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Localization</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {profile.currency} • {languages.find(l => l.value === profile.language)?.label}
          </p>
        </Card>

        <Card className="glass-card p-6 text-center hover-glow">
          <Target className="w-8 h-8 text-accent mx-auto mb-3" />
          <h3 className="font-semibold text-foreground">Investment Style</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {experienceLevels.find(l => l.value === profile.experienceLevel)?.label} • {investmentGoals.find(g => g.value === profile.investmentGoal)?.label}
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Profile;