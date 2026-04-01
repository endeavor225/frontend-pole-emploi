import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Undo,
  Redo,
  List,
  ListOrdered,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

// Extensions renommées pour éviter les conflits "Duplicate extension names"
const CustomUnderline = Underline.extend({
  name: "customUnderline",
});

const CustomLink = Link.extend({
  name: "customLink",
});

// Robust Toolbar Button
const ToolbarButton = ({
  isActive,
  disabled,
  title,
  children,
  onMouseDown,
}) => (
  <button
    type="button"
    onMouseDown={onMouseDown}
    disabled={disabled}
    title={title}
    className={cn(
      "p-2 rounded-md transition-all duration-200 border border-transparent flex items-center justify-center",
      isActive
        ? "bg-[#f48c06] text-white shadow-md"
        : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80",
      disabled && "opacity-30 cursor-not-allowed",
    )}
    style={isActive ? { backgroundColor: "#f48c06", color: "white" } : {}}
  >
    {children}
  </button>
);

// Définition statique des extensions de base pour éviter les avertissements de doublons
const BASE_EXTENSIONS = [
  StarterKit.configure({
    history: { depth: 100 },
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
  CustomUnderline,
  CustomLink.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-[#f48c06] underline cursor-pointer" },
  }),
];

export function RichTextEditor({
  value,
  onChange,
  onBlur,
  placeholder = "Commencez à écrire...",
  className,
  error,
}) {
  // Use a unique ID or stable key to help React/Tiptap state stability
  const [, setUpdateCount] = useState(0);
  const forceUpdate = useCallback(() => setUpdateCount((v) => v + 1), []);

  // Mémoriser les extensions finales
  const extensions = useMemo(
    () => [...BASE_EXTENSIONS, Placeholder.configure({ placeholder })],
    [placeholder],
  );

  const editor = useEditor(
    {
      shouldRerenderOnTransaction: true,
      extensions,
      content: value || "", // Essential for refresh
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onChange?.(html === "<p></p>" ? "" : html);
        forceUpdate();
      },
      onSelectionUpdate: forceUpdate,
      onTransaction: forceUpdate,
      onBlur: () => onBlur?.(),
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-sm max-w-none focus:outline-none min-h-[220px] p-4 text-foreground leading-relaxed",
            className,
          ),
        },
      },
    },
    [extensions],
  ); // Dependency on memoized extensions

  // Double-sync for external data loads or resets
  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      // Small optimization: don't sync if typing (focused)
      if (!editor.isFocused) {
        // Use a small timeout or check to avoid loop
        const isActuallyDifferent =
          value === "" && editor.getHTML() === "<p></p>" ? false : true;
        if (isActuallyDifferent) {
          editor.commands.setContent(value || "", false);
        }
      }
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex flex-col w-full rounded-lg border border-input bg-background transition-all focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden shadow-sm",
        error && "border-destructive focus-within:ring-destructive",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5 p-2 border-b border-border bg-muted/20 sm:gap-2">
        <ToolbarButton
          isActive={editor.isActive("bold")}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          title="Gras (Cmd+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("italic")}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          title="Italique (Cmd+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("customUnderline")}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
          }}
          title="Souligné (Cmd+U)"
        >
          <UnderlineIcon className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border/80 mx-1 hidden sm:block" />

        <ToolbarButton
          isActive={editor.isActive("bulletList")}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          title="Liste à puces"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          isActive={editor.isActive("orderedList")}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          title="Liste ordonnée"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <div className="w-px h-6 bg-border/80 mx-1 hidden sm:block" />

        <ToolbarButton
          disabled={!editor.can().undo()}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().undo().run();
          }}
          title="Annuler"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarButton
          disabled={!editor.can().redo()}
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().redo().run();
          }}
          title="Rétablir"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror {
          outline: none !important;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
        }
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin: 0.75rem 0 !important;
        }
        .ProseMirror li {
          margin-bottom: 0.35rem !important;
        }
        .ProseMirror p {
          margin-bottom: 0.5rem !important;
        }
      `}</style>
    </div>
  );
}
