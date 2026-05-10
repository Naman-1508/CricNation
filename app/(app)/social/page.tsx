"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, MoreHorizontal, PenSquare, Flame, X, Send } from "lucide-react";
import { trpc } from "@/app/_trpc/client";

function getInitialsColor(name: string) {
  const colors = ["#E8390E", "#2563EB", "#16A34A", "#7C3AED", "#DB2777", "#0891B2", "#D97706"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function Avatar({ name, image, size = 10 }: { name: string; image?: string | null; size?: number }) {
  const bg = getInitialsColor(name);
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  if (image) return <img src={image} alt={name} className={`w-${size} h-${size} rounded-2xl object-cover`} />;
  return (
    <div className={`w-${size} h-${size} rounded-2xl flex items-center justify-center font-bold text-white text-xs shrink-0`} style={{ backgroundColor: bg }}>
      {initials}
    </div>
  );
}

// ─── Post Composer Sheet ─────────────────────────────────────────
function ComposeSheet({ isOpen, onClose, onPost }: { isOpen: boolean; onClose: () => void; onPost: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-40" onClick={onClose} />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#1A1A1A]">New Post</h3>
              <button onClick={onClose}><X className="w-5 h-5 text-[#8A8278]" /></button>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="What happened in your match?"
              autoFocus
              maxLength={500}
              rows={4}
              className="w-full bg-[#F2EFE9] rounded-xl p-4 text-sm text-[#1A1A1A] placeholder:text-[#8A8278] resize-none focus:outline-none focus:ring-1 focus:ring-[#E8390E]"
            />
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-[#8A8278]">{text.length}/500</span>
              <button
                disabled={!text.trim()}
                onClick={() => { onPost(text.trim()); setText(""); onClose(); }}
                className="bg-[#E8390E] text-white font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" /> Post
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Post Card ─────────────────────────────────────────────────
function PostCard({ post }: { post: any }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes ?? 0);
  const toggleLike = trpc.player.toggleLike.useMutation({
    onSuccess: (d) => { setLiked(d.liked); setLikeCount((c: number) => d.liked ? c + 1 : c - 1); },
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2.5 items-center">
          <Avatar name={post.user?.name ?? "User"} image={post.user?.image} size={10} />
          <div>
            <p className="font-semibold text-sm text-[#1A1A1A] flex items-center gap-1.5">
              {post.user?.name ?? "CricNation"}
              {post.isAutoPost && <span className="text-[9px] bg-[#E8390E]/10 text-[#E8390E] px-1.5 py-0.5 rounded-full font-bold">AUTO</span>}
            </p>
            <p className="text-xs text-[#8A8278]">{post.time}</p>
          </div>
        </div>
        <button className="text-[#8A8278] p-1"><MoreHorizontal className="w-4 h-4" /></button>
      </div>

      {/* Content */}
      <p className="text-sm text-[#4A4540] leading-relaxed mb-3">{post.content}</p>

      {/* Match badge */}
      {post.matchId && (
        <div className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white rounded-xl px-3 py-2 text-xs mb-3">
          <span className="w-1.5 h-1.5 bg-[#E8390E] rounded-full animate-pulse" />
          Live Match Score
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-5 pt-3 border-t border-[rgba(107,74,42,0.08)]">
        <motion.button whileTap={{ scale: 0.85 }} onClick={() => toggleLike.mutate({ postId: post.id })}
          className={`flex items-center gap-1.5 text-sm transition-colors ${liked ? "text-[#E8390E]" : "text-[#8A8278] hover:text-[#E8390E]"}`}>
          <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
          <span>{likeCount}</span>
        </motion.button>
        <button className="flex items-center gap-1.5 text-sm text-[#8A8278] hover:text-[#1A1A1A] transition-colors">
          <MessageCircle className="w-4 h-4" />
          <span>{post.comments ?? 0}</span>
        </button>
        <button onClick={() => { navigator.clipboard?.writeText(window.location.origin + (post.matchId ? `/matches/${post.matchId}` : "")); }}
          className="flex items-center gap-1.5 text-sm text-[#8A8278] hover:text-[#1A1A1A] transition-colors ml-auto">
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function SocialFeedPage() {
  const { data: posts, isLoading, refetch } = trpc.player.getFeed.useQuery();
  const [composing, setComposing] = useState(false);
  const createPost = trpc.player.createPost.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-28">
      {/* Header */}
      <div className="bg-white border-b border-[rgba(107,74,42,0.1)] px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" /> Feed
          </h1>
        </div>
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setComposing(true)}
          className="w-10 h-10 bg-[#E8390E] rounded-2xl flex items-center justify-center shadow-[0_4px_12px_rgba(232,57,14,0.3)]">
          <PenSquare className="w-4.5 h-4.5 text-white" />
        </motion.button>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* Compose bar */}
        <button onClick={() => setComposing(true)}
          className="w-full bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 flex items-center gap-3 text-left hover:border-[rgba(107,74,42,0.25)] transition-colors">
          <div className="w-9 h-9 bg-[#F2EFE9] rounded-xl flex items-center justify-center text-[#8A8278]">🏏</div>
          <p className="text-sm text-[#8A8278]">Share a match moment...</p>
        </button>

        {/* Posts */}
        {isLoading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border border-[rgba(107,74,42,0.13)] rounded-2xl p-4 h-32 animate-pulse" />
          ))
        ) : !posts || posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-center">
            <div className="text-5xl">🏏</div>
            <p className="font-semibold text-[#1A1A1A]">No posts yet</p>
            <p className="text-sm text-[#8A8278]">Score a match and share the moment!</p>
            <button onClick={() => setComposing(true)}
              className="bg-[#E8390E] text-white font-semibold px-6 py-3 rounded-xl shadow-[0_4px_16px_rgba(232,57,14,0.35)] mt-2 text-sm">
              Write First Post
            </button>
          </div>
        ) : (
          posts.map((post: any) => <PostCard key={post.id} post={post} />)
        )}
      </div>

      <ComposeSheet
        isOpen={composing}
        onClose={() => setComposing(false)}
        onPost={(text) => createPost.mutate({ content: text })}
      />
    </div>
  );
}
