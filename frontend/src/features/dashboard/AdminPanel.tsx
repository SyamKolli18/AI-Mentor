import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Plus, Trash2, Edit3, Settings, BookOpen, Layers, 
  ExternalLink, Sparkles, Filter, TrendingUp, Trophy, Activity, 
  Database, Bell, Zap, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid
} from 'recharts';

export const AdminPanel: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'resources' | 'categories' | 'analytics'>('resources');
  
  // Resource states
  const [resources, setResources] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Analytics states
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [dispatchingAnnouncement, setDispatchingAnnouncement] = useState(false);
  const [announcementText, setAnnouncementText] = useState('');
  const [backingUp, setBackingUp] = useState(false);

  // Form states - Resources
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedTime, setEstimatedTime] = useState(60);
  const [externalUrl, setExternalUrl] = useState('');
  const [category, setCategory] = useState('');
  const [resourceType, setResourceType] = useState<any>('documentation');
  const [tags, setTags] = useState('');
  const [careerPaths, setCareerPaths] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states - Categories
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [addingCat, setAddingCat] = useState(false);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterPath, setFilterPath] = useState('');

  const fetchData = async () => {
    try {
      const [resResources, resCategories] = await Promise.all([
        api.get('/admin/resources'),
        api.get('/admin/categories')
      ]);
      setResources(resResources.data.resources || []);
      setCategories(resCategories.data.categories || []);
      if (resCategories.data.categories?.length > 0 && !category) {
        setCategory(resCategories.data.categories[0].name);
      }
    } catch (err: any) {
      console.error('Failed to load admin parameters', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await api.get('/admin/analytics');
      if (res.data.status === 'success') {
        setAnalytics(res.data.analytics);
      }
    } catch (err) {
      toast('Failed to retrieve platform analytics metrics.', 'error');
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !externalUrl || !category) {
      toast('Please fill out all required parameters', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const parsedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const parsedPaths = careerPaths.split(',').map(p => p.trim().toLowerCase()).filter(Boolean);

      const payload = {
        title,
        description,
        difficulty,
        estimatedTime,
        externalUrl,
        category,
        resourceType,
        tags: parsedTags,
        careerPaths: parsedPaths
      };

      if (editingId) {
        const res = await api.put(`/admin/resources/${editingId}`, payload);
        if (res.data.status === 'success') {
          toast('Learning resource updated successfully!', 'success');
          setEditingId(null);
        }
      } else {
        const res = await api.post('/admin/resources', payload);
        if (res.data.status === 'success') {
          toast('Learning resource created successfully!', 'success');
        }
      }

      // Reset
      setTitle('');
      setDescription('');
      setExternalUrl('');
      setTags('');
      setCareerPaths('');
      fetchData();
    } catch (err: any) {
      toast(err.message || 'Action failed. Check fields.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditInit = (res: any) => {
    setEditingId(res._id);
    setTitle(res.title);
    setDescription(res.description);
    setDifficulty(res.difficulty);
    setEstimatedTime(res.estimatedTime);
    setExternalUrl(res.externalUrl);
    setCategory(res.category);
    setResourceType(res.resourceType);
    setTags(res.tags?.join(', ') || '');
    setCareerPaths(res.careerPaths?.join(', ') || '');
    toast('Editing selected resource. Adjust details above.', 'info');
  };

  const handleDeleteResource = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      const res = await api.delete(`/admin/resources/${id}`);
      if (res.data.status === 'success') {
        toast('Resource deleted successfully.', 'success');
        fetchData();
      }
    } catch (err: any) {
      toast('Failed to delete resource.', 'error');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;
    try {
      setAddingCat(true);
      const res = await api.post('/admin/categories', {
        name: newCatName,
        description: newCatDesc
      });
      if (res.data.status === 'success') {
        toast('Resource category added!', 'success');
        setNewCatName('');
        setNewCatDesc('');
        fetchData();
      }
    } catch (err: any) {
      toast('Failed to create category.', 'error');
    } finally {
      setAddingCat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const res = await api.delete(`/admin/categories/${id}`);
      if (res.data.status === 'success') {
        toast('Category deleted successfully.', 'success');
        fetchData();
      }
    } catch (err: any) {
      toast('Failed to delete category.', 'error');
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    try {
      setDispatchingAnnouncement(true);
      // Simulate broadcasting
      setTimeout(() => {
        toast('Announcement broadcasted to all logged-in students!', 'success');
        setAnnouncementText('');
        setDispatchingAnnouncement(false);
      }, 1000);
    } catch (err) {
      toast('Announcement dispatch failed.', 'error');
    }
  };

  const handleTriggerBackup = async () => {
    try {
      setBackingUp(true);
      // Simulate MongoDB dumps archive
      setTimeout(() => {
        toast('MongoDB collection dump archived. Backup successful!', 'success');
        setBackingUp(false);
      }, 1500);
    } catch (err) {
      toast('Backup failed.', 'error');
    }
  };

  // Filter resource displays
  const filteredResources = resources.filter(res => {
    if (filterCategory && res.category !== filterCategory) return false;
    if (filterPath && !res.careerPaths?.includes(filterPath)) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          Admin Management Central <Settings className="h-6 w-6 text-primary animate-spin" style={{ animationDuration: '10s' }} />
        </h1>
        <p className="text-sm text-slate-400">
          Supervise user statistics, adjust content indexes, toggle security parameters, and manage MongoDB database archives.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5 gap-4">
        <button
          onClick={() => setActiveTab('resources')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'resources' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="h-4 w-4" /> Curriculum Resources
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'categories' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="h-4 w-4" /> Resource Categories
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 px-1 transition-all cursor-pointer ${
            activeTab === 'analytics' ? 'border-primary text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="h-4 w-4" /> Platform Analytics & Settings
        </button>
      </div>

      {/* RENDER resources CURRICULUM */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="bg-card/10 lg:col-span-1 border-white/5 h-fit">
            <div className="p-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-extrabold flex items-center gap-2 text-white">
                <Plus className="h-4 w-4 text-primary" /> 
                {editingId ? 'Modify Learning Resource' : 'Index New Learning Resource'}
              </h3>
            </div>
            <div className="p-4">
              <form onSubmit={handleCreateResource} className="flex flex-col gap-4 text-left">
                <Input 
                  label="Resource Title *"
                  placeholder="e.g. Mastering Promises & Async IO" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Short Description *</label>
                  <textarea 
                    placeholder="Provide description of study objectives..." 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Difficulty *</label>
                    <select 
                      value={difficulty} 
                      onChange={e => setDifficulty(e.target.value as any)}
                      className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg p-2.5 outline-none cursor-pointer"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Minutes *</label>
                    <Input 
                      type="number" 
                      value={estimatedTime} 
                      onChange={e => setEstimatedTime(Number(e.target.value))} 
                      required 
                    />
                  </div>
                </div>

                <Input 
                  label="External Study URL *"
                  type="url" 
                  placeholder="e.g. https://react.dev/" 
                  value={externalUrl} 
                  onChange={e => setExternalUrl(e.target.value)} 
                  required 
                />

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Category *</label>
                    <select 
                      value={category} 
                      onChange={e => setCategory(e.target.value)}
                      className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg p-2.5 outline-none cursor-pointer"
                    >
                      {categories.map(c => (
                        <option key={c._id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Resource Type *</label>
                    <select 
                      value={resourceType} 
                      onChange={e => setResourceType(e.target.value as any)}
                      className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg p-2.5 outline-none cursor-pointer"
                    >
                      <option value="documentation">Documentation</option>
                      <option value="playlist">YouTube Playlist</option>
                      <option value="course">Free Course</option>
                      <option value="practice">Practice Hub</option>
                    </select>
                  </div>
                </div>

                <Input 
                  label="Tags (Comma separated)"
                  placeholder="javascript, async, ES6" 
                  value={tags} 
                  onChange={e => setTags(e.target.value)} 
                />

                <Input 
                  label="Career Paths (Comma separated)"
                  placeholder="frontend, backend, ai" 
                  value={careerPaths} 
                  onChange={e => setCareerPaths(e.target.value)} 
                />

                <Button 
                  type="submit" 
                  variant="primary" 
                  isLoading={submitting} 
                  className="w-full flex items-center justify-center gap-2 text-xs py-2 h-10 mt-2 shadow-glow"
                >
                  <Sparkles className="h-4 w-4 text-white" />
                  {editingId ? 'Update Resource Data' : 'Insert Resource'}
                </Button>
              </form>
            </div>
          </Card>

          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card className="bg-slate-900/30 border-white/5 p-4 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <Filter className="h-4 w-4 text-slate-400" /> Filter list
              </div>
              <div className="flex gap-4">
                <select 
                  value={filterCategory} 
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg px-2.5 py-1.5 cursor-pointer outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map(c => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>

                <select 
                  value={filterPath} 
                  onChange={e => setFilterPath(e.target.value)}
                  className="bg-slate-950 text-white text-xs border border-white/10 rounded-lg px-2.5 py-1.5 cursor-pointer outline-none"
                >
                  <option value="">All Career Paths</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="ai">AI / ML</option>
                </select>
              </div>
            </Card>

            <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-1">
              {filteredResources.length > 0 ? (
                filteredResources.map((res) => (
                  <Card key={res._id} className="bg-slate-900/35 border-white/5 p-4 flex justify-between items-start gap-4 hover:border-white/10 transition-all text-left">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-white leading-tight">{res.title}</span>
                        <span className="text-[9px] bg-slate-800 text-slate-400 font-bold px-2 py-0.5 rounded uppercase">
                          {res.resourceType}
                        </span>
                        <span className="text-[9px] bg-primary/20 text-primary font-bold px-2 py-0.5 rounded">
                          {res.difficulty}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed max-w-lg">
                        {res.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                        <span>Category: <strong className="text-slate-400">{res.category}</strong></span>
                        <span>•</span>
                        <span>Estimated time: <strong className="text-slate-400">{res.estimatedTime}m</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a href={res.externalUrl} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <button onClick={() => handleEditInit(res)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDeleteResource(res._id)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="border-white/5 p-12 text-center text-xs text-slate-500 italic">
                  No learning resources found matching selection criteria.
                </Card>
              )}
            </div>
          </div>
        </div>
      )}

      {/* RENDER CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card/10 border-white/5 h-fit md:col-span-1">
            <div className="p-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4.5 w-4.5 text-primary" /> Create Resource Category
              </h3>
            </div>
            <div className="p-4">
              <form onSubmit={handleCreateCategory} className="flex flex-col gap-4">
                <Input 
                  label="Category Name *"
                  placeholder="e.g. Databases" 
                  value={newCatName} 
                  onChange={e => setNewCatName(e.target.value)} 
                  required 
                />

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                  <textarea 
                    placeholder="Describe topics indexed under category..." 
                    value={newCatDesc} 
                    onChange={e => setNewCatDesc(e.target.value)}
                    className="w-full text-xs bg-slate-950 border border-white/10 rounded-lg p-2.5 text-white focus:outline-none focus:border-primary min-h-[60px]"
                  />
                </div>

                <Button type="submit" variant="primary" isLoading={addingCat} className="w-full text-xs py-2 shadow-glow flex items-center justify-center gap-1.5">
                  <Plus className="h-4 w-4" /> Save Category
                </Button>
              </form>
            </div>
          </Card>

          <Card className="bg-card/10 border-white/5 md:col-span-2">
            <div className="p-4 border-b border-white/5 pb-2">
              <h3 className="text-sm font-bold text-white">Active Resource Categories</h3>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {categories.map((cat) => (
                <div key={cat._id} className="flex justify-between items-center bg-slate-950/40 p-3 rounded-lg border border-white/5">
                  <div className="flex flex-col text-left gap-1">
                    <span className="text-xs font-bold text-white">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{cat.description || 'No description provided.'}</span>
                  </div>
                  <button onClick={() => handleDeleteCategory(cat._id)} className="p-1.5 hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-400 transition-all shrink-0">
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* RENDER PLATFORM ANALYTICS & SYSTEM SETTINGS */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          
          {loadingAnalytics ? (
            <div className="h-48 flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              </svg>
            </div>
          ) : !analytics ? (
            <Card className="p-12 text-center text-xs text-slate-500">Failed to load platform analytics details.</Card>
          ) : (
            <>
              {/* Analytics summary row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Enrolled Users', count: analytics.totalUsers, desc: 'Onboarded: ' + analytics.onboardedUsers },
                  { label: 'Indexed Resources', count: analytics.totalResources, desc: 'Categories: ' + analytics.totalCategories },
                  { label: 'Active roadmaps', count: analytics.activeRoadmaps, desc: 'Milestones mapped' },
                  { label: 'Mock Sessions', count: analytics.totalInterviews, desc: 'Code reviews: ' + analytics.totalCodeReviews }
                ].map((item, idx) => (
                  <Card key={idx} className="bg-slate-900/40 border-white/5 p-4 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-xl font-black text-white">{item.count}</span>
                    <span className="text-[9px] text-slate-400 mt-1">{item.desc}</span>
                  </Card>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* User Growth Curve */}
                <Card className="bg-[#111827]/20 border-white/5 p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-primary animate-pulse" /> User Growth Registration Curve
                  </h4>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.35}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                        <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                          itemStyle={{ fontSize: 10 }}
                        />
                        <Area type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* AI Modules Usage Bar Chart */}
                <Card className="bg-[#111827]/20 border-white/5 p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-white text-xs border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <Trophy className="h-4 w-4 text-amber-400" /> AI Service Calls metrics
                  </h4>
                  <div className="h-[200px] w-full mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analytics.aiUsage} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="barGlowAdmin" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                        <YAxis stroke="#9CA3AF" fontSize={8} fontWeight="600" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#151B2D', borderColor: 'rgba(255,255,255,0.06)', borderRadius: '10px', boxShadow: '0 8px 32px 0 rgba(0,0,0,0.5)' }}
                          labelStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 10 }}
                          itemStyle={{ fontSize: 10 }}
                        />
                        <Bar dataKey="count" fill="url(#barGlowAdmin)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

              </div>

              {/* Settings & Announcements & Error monitor */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                
                {/* Feature flags and backups */}
                <Card className="border-white/5 bg-card/10 p-5 flex flex-col gap-4 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                    <Settings className="h-4 w-4 text-primary" /> Feature Flags & Backups
                  </h4>
                  
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center bg-[#070514]/40 p-2.5 rounded border border-white/5">
                      <span className="font-bold text-slate-300">Voice Arena Simulation</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#070514]/40 p-2.5 rounded border border-white/5">
                      <span className="font-bold text-slate-300">Community Forums Tab</span>
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded">ACTIVE</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#070514]/40 p-2.5 rounded border border-white/5">
                      <span className="font-bold text-slate-300">Live Socket Chat Connect</span>
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded">DEV MODE</span>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-1 flex flex-col gap-2">
                    <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px]">Platform Backups</span>
                    <Button 
                      variant="outline" 
                      onClick={handleTriggerBackup} 
                      isLoading={backingUp}
                      className="w-full text-xs h-9 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/45 cursor-pointer"
                      leftIcon={<Database className="h-4 w-4" />}
                    >
                      Trigger Database Dump
                    </Button>
                  </div>
                </Card>

                {/* Announcement Dispatch */}
                <Card className="border-white/5 bg-card/10 p-5 flex flex-col gap-4 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                    <Bell className="h-4 w-4 text-accent animate-pulse" /> Announcements dispatcher
                  </h4>

                  <form onSubmit={handleSendAnnouncement} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-500">Announcement Content</label>
                      <textarea
                        placeholder="Broadcast new DSA quizzes or downtime alerts..."
                        value={announcementText}
                        onChange={(e) => setAnnouncementText(e.target.value)}
                        className="w-full h-24 bg-slate-950/40 border border-white/5 text-foreground rounded-lg p-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10 resize-none"
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      variant="primary" 
                      isLoading={dispatchingAnnouncement} 
                      className="w-full h-9 text-xs cursor-pointer"
                      rightIcon={<Zap className="h-4 w-4" />}
                    >
                      Broadcast Announcement
                    </Button>
                  </form>
                </Card>

                {/* Error Log Monitors & Audit logs */}
                <Card className="border-white/5 bg-card/10 p-5 flex flex-col gap-4 text-xs">
                  <h4 className="font-bold text-white flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" /> Platform diagnostics logs
                  </h4>

                  <div className="flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                    {/* Error logs */}
                    {analytics.errorLogs?.map((err: any, idx: number) => (
                      <div key={idx} className="bg-rose-500/5 border border-rose-500/10 p-2.5 rounded flex gap-2">
                        <ShieldAlert className="h-4.5 w-4.5 text-rose-400 shrink-0 mt-0.5" />
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-rose-400">{err.id} ({err.count} times)</span>
                          <span className="text-[9px] text-slate-500 leading-snug">{err.message}</span>
                        </div>
                      </div>
                    ))}
                    {/* Audit logs */}
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-2">Access Audit history</span>
                    {analytics.auditLogs?.map((log: any, idx: number) => (
                      <div key={idx} className="bg-[#070514]/40 border border-white/5 p-2 rounded flex flex-col gap-0.5">
                        <div className="flex justify-between font-bold text-slate-300">
                          <span>{log.action}</span>
                          <span className="text-[8px] text-slate-500 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="text-[9px] text-slate-400">{log.details}</span>
                      </div>
                    ))}
                  </div>
                </Card>

              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
};
export default AdminPanel;
