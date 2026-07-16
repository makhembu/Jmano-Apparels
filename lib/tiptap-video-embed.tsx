import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import React, { useCallback } from 'react';
import { getVideoEmbedUrl } from './video-utils';

/**
 * VideoEmbed — custom Tiptap node that renders a live video preview
 * (iframe or <video>) inside the editor, replacing raw HTML embeds.
 */

// ─── React Node View ───────────────────────────────────────────────────────
const VideoEmbedComponent: React.FC<{ node: any; updateAttributes: any; deleteNode: any }> = ({
  node,
  updateAttributes,
  deleteNode,
}) => {
  const { src, type } = node.attrs;

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      deleteNode();
    },
    [deleteNode],
  );

  const handleUpdateUrl = useCallback(() => {
    const newUrl = window.prompt('Update video URL', src);
    if (newUrl !== null && newUrl.trim()) {
      const normalized = getVideoEmbedUrl(newUrl.trim()) || newUrl.trim();
      updateAttributes({ src: normalized });
    }
  }, [src, updateAttributes]);

  if (!src) {
    return (
      <div className="my-4 border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 text-slate-400 text-sm">
        No video source — click to add
      </div>
    );
  }

  return (
    <div className="my-4 group relative video-responsive not-prose">
      {/* Overlay controls — visible on hover */}
      <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={handleUpdateUrl}
          className="bg-white/90 hover:bg-white text-slate-700 text-xs font-bold px-2 py-1 rounded shadow"
          title="Change video URL"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleRemove}
          className="bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow"
          title="Remove video"
        >
          ✕
        </button>
      </div>

      {/* Actual video preview */}
      {type === 'video' ? (
        <video
          src={src}
          controls
          preload="metadata"
          className="w-full rounded-lg shadow-md bg-black"
        />
      ) : (
        <iframe
          src={src}
          title="Embedded video"
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full aspect-video rounded-lg shadow-md border-0"
        />
      )}
    </div>
  );
};

// ─── Tiptap Node Definition ────────────────────────────────────────────────
export const VideoEmbed = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,            // user cannot edit inside it
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      type: { default: 'iframe', parseHTML: (el) => el.getAttribute('data-type') || 'iframe' },
    };
  },

  parseHTML() {
    return [
      // Parse <div class="video-responsive"><iframe …></iframe></div>
      {
        tag: 'div.video-responsive',
        getAttrs: (el) => {
          const iframe = el.querySelector('iframe');
          const video = el.querySelector('video');
          if (iframe) return { src: iframe.getAttribute('src'), type: 'iframe' };
          if (video) return { src: video.getAttribute('src'), type: 'video' };
          return false;
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, type } = HTMLAttributes;
    if (type === 'video') {
      return [
        'div',
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'video-responsive' }),
        ['video', { src, controls: true, preload: 'metadata', class: 'w-full h-full' }],
      ];
    }
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: 'video-responsive' }),
      [
        'iframe',
        {
          src,
          title: 'Embedded video',
          loading: 'lazy',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
          allowFullScreen: true,
        },
      ],
    ];
  },

  addCommands() {
    return {
      insertVideoEmbed:
        (attrs: { src: string; type?: 'iframe' | 'video' }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: { src: attrs.src, type: attrs.type || 'iframe' },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent);
  },
});

// ─── TypeScript command declarations ──────────────────────────────────────
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    videoEmbed: {
      insertVideoEmbed: (attrs: { src: string; type?: 'iframe' | 'video' }) => ReturnType;
    };
  }
}
