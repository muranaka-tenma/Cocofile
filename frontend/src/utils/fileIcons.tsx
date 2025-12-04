/* eslint-disable react-refresh/only-export-components */
import {
  FileText,
  FileSpreadsheet,
  File,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  FileJson,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

export type FileType =
  | "pdf"
  | "excel"
  | "word"
  | "powerpoint"
  | "image"
  | "video"
  | "audio"
  | "archive"
  | "code"
  | "json"
  | "text"
  | "folder"
  | "unknown";

interface FileIconConfig {
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

const fileIconMap: Record<FileType, FileIconConfig> = {
  pdf: {
    icon: FileText,
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950/30",
  },
  excel: {
    icon: FileSpreadsheet,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950/30",
  },
  word: {
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  powerpoint: {
    icon: FileText,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950/30",
  },
  image: {
    icon: FileImage,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950/30",
  },
  video: {
    icon: FileVideo,
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950/30",
  },
  audio: {
    icon: FileAudio,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 dark:bg-indigo-950/30",
  },
  archive: {
    icon: FileArchive,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  code: {
    icon: FileCode,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950/30",
  },
  json: {
    icon: FileJson,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
  },
  text: {
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
  },
  folder: {
    icon: FolderOpen,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
  },
  unknown: {
    icon: File,
    color: "text-gray-500",
    bgColor: "bg-gray-50 dark:bg-gray-950/30",
  },
};

const extensionMap: Record<string, FileType> = {
  // Documents
  pdf: "pdf",
  xlsx: "excel",
  xls: "excel",
  csv: "excel",
  doc: "word",
  docx: "word",
  ppt: "powerpoint",
  pptx: "powerpoint",

  // Images
  jpg: "image",
  jpeg: "image",
  png: "image",
  gif: "image",
  bmp: "image",
  svg: "image",
  webp: "image",
  ico: "image",

  // Videos
  mp4: "video",
  avi: "video",
  mkv: "video",
  mov: "video",
  wmv: "video",
  flv: "video",
  webm: "video",

  // Audio
  mp3: "audio",
  wav: "audio",
  flac: "audio",
  aac: "audio",
  ogg: "audio",
  wma: "audio",
  m4a: "audio",

  // Archives
  zip: "archive",
  rar: "archive",
  "7z": "archive",
  tar: "archive",
  gz: "archive",
  bz2: "archive",

  // Code
  js: "code",
  ts: "code",
  jsx: "code",
  tsx: "code",
  py: "code",
  java: "code",
  cpp: "code",
  c: "code",
  h: "code",
  cs: "code",
  php: "code",
  rb: "code",
  go: "code",
  rs: "code",
  swift: "code",
  kt: "code",
  html: "code",
  css: "code",
  scss: "code",
  sass: "code",
  less: "code",

  // JSON
  json: "json",
  jsonc: "json",

  // Text
  txt: "text",
  md: "text",
  log: "text",
  xml: "text",
  yaml: "text",
  yml: "text",
  toml: "text",
  ini: "text",
  conf: "text",
  cfg: "text",
};

export function getFileType(filename: string): FileType {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) return "unknown";
  return extensionMap[extension] || "unknown";
}

export function getFileIcon(filename: string): FileIconConfig {
  const fileType = getFileType(filename);
  return fileIconMap[fileType];
}

export function FileIcon({
  filename,
  className = "h-5 w-5",
}: {
  filename: string;
  className?: string;
}) {
  const { icon: Icon, color } = getFileIcon(filename);
  return <Icon className={`${className} ${color}`} />;
}

export function FileIconWithBg({
  filename,
  className = "h-10 w-10",
}: {
  filename: string;
  className?: string;
}) {
  const { icon: Icon, color, bgColor } = getFileIcon(filename);
  return (
    <div
      className={`${bgColor} ${className} rounded-lg flex items-center justify-center`}
    >
      <Icon className={`h-5 w-5 ${color}`} />
    </div>
  );
}
