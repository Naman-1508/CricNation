"use client";

import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { trpc } from "@/app/_trpc/client";

export default function SocialFeedPage() {
  const { data: posts, isLoading } = trpc.player.getFeed.useQuery();

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <h1 className="text-2xl font-heading font-bold mb-6">Social Feed</h1>

      <div className="space-y-4">
        {/* Create Post */}
        <div className="bg-surface border border-border rounded-xl p-4 flex gap-3">
          <div className="w-10 h-10 bg-muted rounded-full shrink-0 flex items-center justify-center">Me</div>
          <div className="flex-1">
            <input 
              placeholder="What's on your mind?" 
              className="w-full bg-transparent border-none focus:outline-none text-sm placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : posts?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">No posts available</div>
        ) : posts?.map((post: any) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-surface border border-border rounded-xl p-4"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="flex gap-2 items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${post.isAutoPost ? 'bg-primary/20 text-primary' : 'bg-muted'}`}>
                  {post.isAutoPost ? 'CN' : 'US'}
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1">
                    {post.user}
                    {post.isAutoPost && <span className="text-[10px] bg-primary/20 text-primary px-1.5 rounded">Auto</span>}
                  </h3>
                  <p className="text-xs text-muted-foreground">{post.time}</p>
                </div>
              </div>
              <button className="text-muted-foreground"><MoreHorizontal className="w-4 h-4" /></button>
            </div>

            <p className="text-sm mb-4">{post.content}</p>

            <div className="flex items-center gap-6 pt-3 border-t border-border">
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-red-500 text-sm">
                <Heart className="w-4 h-4" /> {post.likes}
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm">
                <MessageCircle className="w-4 h-4" /> {post.comments}
              </button>
              <button className="flex items-center gap-1.5 text-muted-foreground hover:text-primary text-sm ml-auto">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
