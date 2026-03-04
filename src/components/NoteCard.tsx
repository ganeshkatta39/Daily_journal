import type React from "react";
import { Calendar, Trash2 } from "lucide-react";
type Mood =
  | "happy"
  | "sad"
  | "indifferent"
  | "angry"
  | "anxious"
  | "destressed";

interface Note {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: Mood;
}

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function NoteCard({ note, onClick, onDelete }: NoteCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer group relative"
    >
      <button
        onClick={onDelete}
        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete note"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{note.date}</span>
        </div>
        {note.mood && (
          <div className="pr-8">
            {note.mood}
            {/* <MoodIcon mood={note.mood} size={20} /> */}
          </div>
        )}
      </div>

      {note.title && (
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {note.title}
        </h3>
      )}

      {note.content && (
        <p className="text-gray-600 text-sm line-clamp-3">{note.content}</p>
      )}

      {!note.title && !note.content && (
        <p className="text-gray-400 italic text-sm">Empty note</p>
      )}
    </div>
  );
}
