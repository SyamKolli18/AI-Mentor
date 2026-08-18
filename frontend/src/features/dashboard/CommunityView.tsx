import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { 
  Sparkles, Users, MessageSquare, Trophy, FolderHeart, Star, 
  Plus, ExternalLink, Award
} from 'lucide-react';

export const CommunityView: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'forums' | 'groups' | 'showcase' | 'leaderboard'>('forums');
  const [loading, setLoading] = useState(true);

  // Forums state
  const [forums, setForums] = useState<any[]>([]);
  const [selectedForum, setSelectedForum] = useState<any>(null);
  const [forumTitle, setForumTitle] = useState('');
  const [forumContent, setForumContent] = useState('');
  const [forumCategory, setForumCategory] = useState<'General' | 'Career' | 'Technical'>('General');
  const [commentText, setCommentText] = useState('');
  const [submittingForum, setSubmittingForum] = useState(false);

  // Groups state
  const [groups, setGroups] = useState<any[]>([]);

  // Showcase state
  const [showcases, setShowcases] = useState<any[]>([]);
  const [selectedShowcase, setSelectedShowcase] = useState<any>(null);
  const [showcaseTitle, setShowcaseTitle] = useState('');
  const [showcaseDesc, setShowcaseDesc] = useState('');
  const [showcaseRepo, setShowcaseRepo] = useState('');
  const [showcaseLive, setShowcaseLive] = useState('');
  const [submittingShowcase, setSubmittingShowcase] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Leaderboard state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  const fetchForums = async () => {
    try {
      const res = await api.get('/community/forums');
      if (res.data.status === 'success') setForums(res.data.forums || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await api.get('/community/groups');
      if (res.data.status === 'success') setGroups(res.data.groups || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchShowcase = async () => {
    try {
      const res = await api.get('/community/showcase');
      if (res.data.status === 'success') setShowcases(res.data.showcases || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/community/leaderboard');
      if (res.data.status === 'success') setLeaderboard(res.data.leaderboard || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadTabData = async () => {
    setLoading(true);
    if (activeTab === 'forums') await fetchForums();
    else if (activeTab === 'groups') await fetchGroups();
    else if (activeTab === 'showcase') await fetchShowcase();
    else if (activeTab === 'leaderboard') await fetchLeaderboard();
    setLoading(false);
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab]);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forumTitle || !forumContent) {
      toast('Forum title and content are required.', 'error');
      return;
    }
    try {
      setSubmittingForum(true);
      const res = await api.post('/community/forums', {
        title: forumTitle,
        content: forumContent,
        category: forumCategory
      });
      if (res.data.status === 'success') {
        toast('Discussion forum thread posted! +10 Helper points awarded.', 'success');
        setForums(prev => [res.data.forum, ...prev]);
        setForumTitle('');
        setForumContent('');
      }
    } catch (err) {
      toast('Failed to create forum thread.', 'error');
    } finally {
      setSubmittingForum(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !selectedForum) return;

    try {
      const res = await api.post(`/community/forums/${selectedForum._id}/comment`, { content: commentText });
      if (res.data.status === 'success') {
        toast('Comment submitted! +5 Helper points logged.', 'success');
        setSelectedForum(res.data.forum);
        fetchForums(); // refresh back log
        setCommentText('');
      }
    } catch (err) {
      toast('Comment action failed.', 'error');
    }
  };

  const handleJoinGroup = async (id: string) => {
    try {
      const res = await api.post('/community/groups/join', { id });
      if (res.data.status === 'success') {
        toast(res.data.message, 'success');
        fetchGroups();
      }
    } catch (err) {
      toast('Failed to update group membership.', 'error');
    }
  };

  const handleCreateShowcase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showcaseTitle || !showcaseDesc || !showcaseRepo) {
      toast('Title, descriptions, and repository link are required.', 'error');
      return;
    }
    try {
      setSubmittingShowcase(true);
      const res = await api.post('/community/showcase', {
        title: showcaseTitle,
        description: showcaseDesc,
        repoUrl: showcaseRepo,
        liveUrl: showcaseLive || undefined
      });
      if (res.data.status === 'success') {
        toast('Project showcase posted successfully! +20 Coding Guru points awarded.', 'success');
        setShowcases(prev => [res.data.showcase, ...prev]);
        setShowcaseTitle('');
        setShowcaseDesc('');
        setShowcaseRepo('');
        setShowcaseLive('');
      }
    } catch (err) {
      toast('Showcase submission failed.', 'error');
    } finally {
      setSubmittingShowcase(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewFeedback.trim() || !selectedShowcase) return;

    try {
      setSubmittingReview(true);
      const res = await api.post(`/community/showcase/${selectedShowcase._id}/review`, {
        rating: reviewRating,
        feedback: reviewFeedback
      });
      if (res.data.status === 'success') {
        toast('Peer review logged successfully! +15 points registered.', 'success');
        setSelectedShowcase(res.data.showcase);
        fetchShowcase();
        setReviewFeedback('');
      }
    } catch (err) {
      toast('Failed to save peer review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white md:text-3xl flex items-center gap-2">
          Community Learning Hub <Sparkles className="h-6 w-6 text-accent animate-pulse" />
        </h1>
        <p className="text-sm text-slate-400">
          Collaborate in peer study clubs, post project showcases, audit classmate submissions, and gain points badges.
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-2 gap-4">
        {[
          { id: 'forums', label: 'Discussion Forums' },
          { id: 'groups', label: 'Study Groups' },
          { id: 'showcase', label: 'Project Showcases' },
          { id: 'leaderboard', label: 'Achievements Leaderboard' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id as any); setSelectedForum(null); setSelectedShowcase(null); }}
            className={`text-xs font-semibold py-2 px-1 relative transition-colors cursor-pointer ${
              activeTab === tab.id ? 'text-primary' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-9px] left-0 right-0 h-[2px] bg-primary" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          </svg>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          
          {/* TAB 1: DISCUSSION FORUMS */}
          {activeTab === 'forums' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Forum listing & details */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {selectedForum ? (
                  <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-5">
                    
                    {/* Selected thread header */}
                    <div className="border-b border-white/5 pb-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedForum(null)}
                        className="text-[10px] h-7 border border-white/5 text-slate-400 font-semibold mb-3"
                      >
                        Back to Topics List
                      </Button>
                      <div className="flex gap-2 mb-1">
                        <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[9px] font-bold border border-primary/25">
                          {selectedForum.category}
                        </span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-2 leading-relaxed">{selectedForum.title}</h3>
                      <span className="text-[10px] text-slate-500 mt-1 block">Author: {selectedForum.authorName} | {new Date(selectedForum.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* Content */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#070514]/40 border border-white/5 rounded-xl p-4">{selectedForum.content}</p>

                    {/* Comments list */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Classmates Responses ({selectedForum.comments?.length || 0})</span>
                      <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
                        {selectedForum.comments?.map((c: any, i: number) => (
                          <div key={i} className="bg-white/2 border border-white/5 p-3 rounded-lg flex flex-col gap-1 text-xs">
                            <div className="flex justify-between font-bold text-slate-200">
                              <span>{c.authorName}</span>
                              <span className="text-[9px] text-slate-500 font-mono">{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Post comment form */}
                    <form onSubmit={handleAddComment} className="flex gap-3 pt-2 border-t border-white/5">
                      <input
                        placeholder="Contribute to discussion..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg px-3 text-xs text-foreground focus:outline-none"
                      />
                      <Button type="submit" variant="primary" className="text-xs h-9 px-4 cursor-pointer" rightIcon={<Plus className="h-4 w-4" />}>
                        Answer
                      </Button>
                    </form>

                  </Card>
                ) : (
                  /* Forums index view */
                  <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4">
                    <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                      <MessageSquare className="h-4.5 w-4.5 text-primary" /> Discussion Forum Topics
                    </h3>
                    
                    {forums.length === 0 ? (
                      <div className="text-center py-6 text-slate-500 italic text-xs">No topics posted yet. Be the first!</div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {forums.map((f: any) => (
                          <div 
                            key={f._id}
                            onClick={() => setSelectedForum(f)}
                            className="bg-[#070514]/40 border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-all cursor-pointer flex flex-col justify-between gap-3 relative group"
                          >
                            <div className="flex flex-col gap-1 w-full">
                              <div className="flex justify-between items-center">
                                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[9px] font-bold border border-primary/25">
                                  {f.category}
                                </span>
                                <span className="text-[10px] text-slate-500">{new Date(f.createdAt).toLocaleDateString()}</span>
                              </div>
                              <h4 className="text-xs font-bold text-white mt-2 group-hover:text-primary transition-colors leading-relaxed">
                                {f.title}
                              </h4>
                              <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2 mt-1">
                                {f.content}
                              </p>
                            </div>
                            
                            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-2">
                              <span>Author: {f.authorName}</span>
                              <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {f.comments?.length || 0} Comments</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                )}
              </div>

              {/* Create Forum form */}
              <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Plus className="h-4.5 w-4.5 text-accent" /> Start a Topic
                </h3>
                
                <form onSubmit={handleCreateForum} className="flex flex-col gap-4">
                  <Input 
                    label="Topic Title"
                    placeholder="e.g. Tips on microservice rate limit algorithms"
                    value={forumTitle}
                    onChange={(e) => setForumTitle(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-slate-300">Category Tag</label>
                    <select
                      value={forumCategory}
                      onChange={(e) => setForumCategory(e.target.value as any)}
                      className="w-full bg-slate-950/40 border border-white/5 text-foreground rounded-lg h-10 px-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10"
                    >
                      <option value="General">General</option>
                      <option value="Career">Career Paths</option>
                      <option value="Technical">Technical Stack</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Detailed Context Descriptions</label>
                    <textarea
                      placeholder="Outline details, questions, or links..."
                      value={forumContent}
                      onChange={(e) => setForumContent(e.target.value)}
                      className="w-full h-28 bg-slate-950/40 border border-white/5 text-foreground rounded-lg p-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10 resize-none"
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="outline" 
                    isLoading={submittingForum}
                    className="w-full h-10 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/45 cursor-pointer"
                  >
                    Publish discussion topic
                  </Button>
                </form>
              </Card>

            </div>
          )}

          {/* TAB 2: STUDY GROUPS */}
          {activeTab === 'groups' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {groups.map((group) => {
                const isMember = group.members?.some((m: string) => m.toString() === 'mockUserId' || m === 'mockUserId'); // mock user id
                return (
                  <Card key={group._id} className="border-white/5 bg-card/10 p-6 flex flex-col justify-between gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="font-extrabold text-white text-base flex items-center gap-1.5"><Users className="h-5 w-5 text-primary" /> {group.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{group.description}</p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-1">
                      <span>{group.members?.length || 0} Members active</span>
                      <span>{group.challengesCompleted} Challenges solved</span>
                    </div>

                    <Button
                      variant={isMember ? 'outline' : 'primary'}
                      onClick={() => handleJoinGroup(group._id)}
                      className="w-full text-xs h-9 cursor-pointer"
                    >
                      {isMember ? 'Leave Group' : 'Join Study Group'}
                    </Button>
                  </Card>
                );
              })}
            </div>
          )}

          {/* TAB 3: PROJECT SHOWCASES */}
          {activeTab === 'showcase' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Showcases listing */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                {selectedShowcase ? (
                  <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-5">
                    
                    {/* Back details */}
                    <div className="border-b border-white/5 pb-4">
                      <Button 
                        variant="ghost" 
                        onClick={() => setSelectedShowcase(null)}
                        className="text-[10px] h-7 border border-white/5 text-slate-400 font-semibold mb-3"
                      >
                        Back to Portfolios
                      </Button>
                      <h3 className="text-base font-extrabold text-white leading-relaxed">{selectedShowcase.title}</h3>
                      <span className="text-[10px] text-slate-500 block mt-1">Author: {selectedShowcase.authorName}</span>
                    </div>

                    {/* Desc */}
                    <p className="text-xs text-slate-300 leading-relaxed bg-[#070514]/40 border border-white/5 rounded-xl p-4">{selectedShowcase.description}</p>
                    
                    {/* Repository Links */}
                    <div className="flex gap-4">
                      <a href={selectedShowcase.repoUrl} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                        <ExternalLink className="h-4.5 w-4.5" /> Code Repository
                      </a>
                      {selectedShowcase.liveUrl && (
                        <a href={selectedShowcase.liveUrl} target="_blank" rel="noreferrer" className="text-xs text-accent flex items-center gap-1 hover:underline">
                          <ExternalLink className="h-4.5 w-4.5" /> Production URL
                        </a>
                      )}
                    </div>

                    {/* Peer reviews */}
                    <div className="flex flex-col gap-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase">Classmates Peer Audits ({selectedShowcase.peerReviews?.length || 0})</span>
                      <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto pr-1">
                        {selectedShowcase.peerReviews?.map((r: any, i: number) => (
                          <div key={i} className="bg-white/2 border border-white/5 p-3 rounded-lg flex flex-col gap-1 text-xs">
                            <div className="flex justify-between items-center font-bold text-slate-200">
                              <span>{r.reviewerName}</span>
                              <span className="text-amber-400 flex items-center gap-0.5"><Star className="h-3 w-3 fill-amber-400/20" /> {r.rating}/5</span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{r.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Submit Peer Review Form */}
                    <form onSubmit={handleSubmitReview} className="border-t border-white/5 pt-4 flex flex-col gap-3">
                      <span className="text-xs font-bold text-white block">Post Peer Review</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5].map(starVal => (
                          <button
                            key={starVal}
                            type="button"
                            onClick={() => setReviewRating(starVal)}
                            className={`p-1.5 text-xs rounded border transition-colors cursor-pointer ${
                              reviewRating === starVal ? 'border-primary bg-primary/10 text-primary' : 'border-white/5 bg-white/2 text-slate-400'
                            }`}
                          >
                            {starVal} Stars
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-3">
                        <input
                          placeholder="Submit constructive feedback on code layouts..."
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                          className="flex-1 bg-slate-950/50 border border-white/10 rounded-lg px-3 text-xs text-foreground focus:outline-none"
                        />
                        <Button type="submit" variant="primary" isLoading={submittingReview} className="text-xs h-9 px-4 cursor-pointer">
                          Submit Audit
                        </Button>
                      </div>
                    </form>

                  </Card>
                ) : (
                  /* Showcases cards view */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {showcases.map((s) => (
                      <Card 
                        key={s._id}
                        onClick={() => setSelectedShowcase(s)}
                        className="border-white/5 bg-card/10 p-5 cursor-pointer hover:border-primary/20 transition-all flex flex-col justify-between gap-3 relative group"
                      >
                        <div className="flex flex-col gap-1.5">
                          <h4 className="text-sm font-bold text-white mt-1 group-hover:text-primary transition-colors leading-snug">
                            {s.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3 mt-1">
                            {s.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-white/5 pt-3 mt-1">
                          <span>Developer: {s.authorName}</span>
                          <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-amber-400/20 text-amber-400" /> {s.peerReviews?.length || 0} Peer Reviews</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Showcase post upload form */}
              <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <FolderHeart className="h-4.5 w-4.5 text-accent animate-pulse" /> Showcase Portfolio
                </h3>
                
                <form onSubmit={handleCreateShowcase} className="flex flex-col gap-4">
                  <Input 
                    label="Project Name"
                    placeholder="e.g. AI-driven task scheduler"
                    value={showcaseTitle}
                    onChange={(e) => setShowcaseTitle(e.target.value)}
                    required
                  />

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-300">Brief Specifications</label>
                    <textarea
                      placeholder="Outline tech stack modules, micro-animations, and database schemas..."
                      value={showcaseDesc}
                      onChange={(e) => setShowcaseDesc(e.target.value)}
                      className="w-full h-28 bg-slate-950/40 border border-white/5 text-foreground rounded-lg p-3 text-xs focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 hover:border-white/10 resize-none"
                      required
                    />
                  </div>

                  <Input 
                    label="Connected GitHub Repo URL"
                    placeholder="https://github.com/username/project-repo"
                    value={showcaseRepo}
                    onChange={(e) => setShowcaseRepo(e.target.value)}
                    required
                  />

                  <Input 
                    label="Simulated Live URL (Optional)"
                    placeholder="https://project.vercel.app"
                    value={showcaseLive}
                    onChange={(e) => setShowcaseLive(e.target.value)}
                  />

                  <Button 
                    type="submit" 
                    variant="outline" 
                    isLoading={submittingShowcase}
                    className="w-full h-10 border-primary/20 text-primary hover:bg-primary/5 hover:border-primary/45 cursor-pointer"
                  >
                    Upload portfolio project
                  </Button>
                </form>
              </Card>

            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS & LEADERBOARD */}
          {activeTab === 'leaderboard' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Leaderboard points table rankings */}
              <Card className="lg:col-span-2 border-white/5 bg-card/10 p-6 flex flex-col gap-4">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Trophy className="h-4.5 w-4.5 text-amber-500 animate-bounce" /> Platform Learners Standings
                </h3>

                {leaderboard.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 italic text-xs">Standings indices loading. Join groups to gain points!</div>
                ) : (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-xs text-left text-slate-300">
                      <thead className="bg-[#070514]/40 text-[10px] uppercase font-bold text-slate-500 border-b border-white/5">
                        <tr>
                          <th className="py-2.5 px-3">Standing</th>
                          <th className="py-2.5 px-3">Student Name</th>
                          <th className="py-2.5 px-3">Total Points</th>
                          <th className="py-2.5 px-3">Badges earned</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {leaderboard.map((user, idx) => (
                          <tr key={user.userId} className="hover:bg-white/2">
                            <td className="py-3 px-3 font-bold text-slate-400">Rank #{idx + 1}</td>
                            <td className="py-3 px-3 font-black text-white">{user.name}</td>
                            <td className="py-3 px-3 text-primary font-bold">{user.points} pts</td>
                            <td className="py-3 px-3 text-slate-400">{user.badgesCount} Badges</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>

              {/* Profile badges cabinet */}
              <Card className="border-white/5 bg-card/10 p-6 flex flex-col gap-4 text-xs text-slate-300 leading-relaxed">
                <h3 className="font-extrabold text-white text-sm flex items-center gap-1.5 border-b border-white/5 pb-2">
                  <Award className="h-4.5 w-4.5 text-primary" /> Badge cabinet guidelines
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  Earn custom badges representing engineering milestones:
                </p>
                <div className="flex flex-col gap-3">
                  {[
                    { badge: 'Coding Guru', description: 'Rewarded for uploading project showcases. (+20 points)' },
                    { badge: 'Consistency Champion', description: 'Rewarded for joining peer study groups. (+15 points)' },
                    { badge: 'Helper Hand', description: 'Rewarded for commenting on forum discussions. (+5 points)' }
                  ].map((b, idx) => (
                    <div key={idx} className="flex gap-2.5 bg-[#070514]/40 border border-white/5 rounded-xl p-3">
                      <Award className="h-7 w-7 text-amber-500 shrink-0 fill-amber-500/10" />
                      <div className="flex flex-col gap-0.5">
                        <span className="font-black text-white text-[11px]">{b.badge}</span>
                        <span className="text-[10px] text-slate-500">{b.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

            </div>
          )}

        </div>
      )}

    </div>
  );
};
export default CommunityView;
