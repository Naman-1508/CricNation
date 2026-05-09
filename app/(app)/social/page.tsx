"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal, PenSquare, Flame, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { trpc } from "@/app/_trpc/client";
import { useState } from "react";

export default function SocialFeedPage() {
  const { data: posts, isLoading } = trpc.player.getFeed.useQuery();
  const [liked, setLiked] = useState<Record<string, boolean>>({});

  const toggleLike = (id: string) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-mesh pb-28">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/80 backdrop-blur-xl border-b border-white/5 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Community</p>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-400" />
              Social Feed
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-2xl glass flex items-center justify-center text-muted-foreground"
          >
            <PenSquare className="w-4.5 h-4.5" />
          </motion.button>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* Create Post */}
        <div className="glass-card p-4 flex gap-3 items-center">
          <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center text-lg shrink-0">
            🏏
          </div>
          <div className="flex-1 bg-white/4 rounded-2xl px-4 py-2.5 cursor-pointer hover:bg-white/6 transition-colors">
            <p className="text-sm text-muted-foreground">Share a match moment...</p>
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="glass-card p-4 space-y-3">
                <div className="flex gap-3">
                  <div className="skeleton w-10 h-10 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-32 rounded" />
                    <div className="skeleton h-2 w-20 rounded" />
                  </div>
                </div>
                <div className="skeleton h-12 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-muted-foreground">
            <Sparkles className="w-12 h-12 opacity-15" />
            <p className="font-medium">No posts yet</p>
            <p className="text-xs opacity-60">Be the first to share a moment!</p>
          </div>
        ) : (
          <AnimatePresence>
            {posts.map((post: any, i: number) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card p-4"
              >
                {/* Post Header */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3 items-center">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold ${
                      post.isAutoPost ? "bg-primary/20 text-primary" : "bg-white/8 text-foreground"
                    }`}>
                      {post.isAutoPost ? "🏏" : "👤"}
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm flex items-center gap-1.5">
                        {post.user}
                        {post.isAutoPost && (
                          <span className="text-[9px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-bold tracking-wide">AUTO</span>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground">{post.time}</p>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground transition-colors p-1">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Post Body */}
                <p className="text-sm leading-relaxed mb-4">{post.content}</p>

                {/* Actions */}
                <div className="flex items-center gap-5 pt-3 border-t border-white/5">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => toggleLike(post.id)}
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      liked[post.id] ? "text-red-400" : "text-muted-foreground hover:text-red-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${liked[post.id] ? "fill-current" : ""}`} />
                    <span>{liked[post.id] ? (post.likes || 0) + 1 : post.likes || 0}</span>
                  </motion.button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.comments || 0}</span>
                  </button>
                  <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm transition-colors ml-auto">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
