import { createReactBlockSpec } from '@blocknote/react';

export const CalloutBlock = createReactBlockSpec(
  {
    type: 'callout',
    propSchema: {
      emoji: { default: '💡' },
      bgColor: { default: 'indigo' },
    },
    content: 'inline',
  },
  {
    render: ({ block, editor, contentRef }) => {
      const bgClasses: Record<string, string> = {
        indigo: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200',
        amber: 'bg-amber-500/10 border-amber-500/30 text-amber-200',
        emerald: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200',
        rose: 'bg-rose-500/10 border-rose-500/30 text-rose-200',
        slate: 'bg-slate-500/10 border-slate-500/30 text-slate-200',
      };

      const selectedBg = bgClasses[block.props.bgColor] || bgClasses.indigo;

      return (
        <div className={`w-full my-2 p-3.5 rounded-xl border flex items-start gap-3 transition-all ${selectedBg}`}>
          <button
            type="button"
            contentEditable={false}
            onClick={() => {
              const emojis = ['💡', '📌', '⚠️', '🎉', 'ℹ️', '🔥', '🚀', '📝'];
              const currentIdx = emojis.indexOf(block.props.emoji);
              const nextEmoji = emojis[(currentIdx + 1) % emojis.length];
              editor.updateBlock(block, {
                props: { ...block.props, emoji: nextEmoji },
              });
            }}
            className="text-xl select-none hover:scale-125 transition-transform cursor-pointer shrink-0 mt-0.5"
            title="Cambiar emoji"
          >
            {block.props.emoji}
          </button>
          <div ref={contentRef} className="flex-1 min-w-0 outline-none leading-relaxed text-sm font-medium" />
        </div>
      );
    },
  }
);
