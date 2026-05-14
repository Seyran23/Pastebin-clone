'use client';

import autosize from 'autosize';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function CommentSection() {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-semibold mb-2 text-zinc-300">Leave a Comment</h3>
      <div className="space-y-3">
        <Textarea
          ref={(el) => { if (el) autosize(el); }}
          placeholder="Write your comment here..."
          className="resize-none min-h-[80px] max-h-[200px] text-sm bg-zinc-900 border-zinc-700 text-neutral-200 placeholder:text-zinc-500 focus:outline-none focus:ring-0"
        />
        <div className="flex justify-end">
          <Button className="bg-zinc-700 hover:bg-zinc-600 text-white">
            Add Comment
          </Button>
        </div>
      </div>
    </div>
  );
}
