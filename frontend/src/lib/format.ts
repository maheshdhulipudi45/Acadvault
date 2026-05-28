import { FileText, FileType, Presentation, Archive, FileImage } from "lucide-react";

export const fileMeta = (ext: string) => {
  const e = ext.toLowerCase().replace(".", "");
  if (e.includes("pdf")) return { label: "PDF", color: "bg-red-100 text-red-600", Icon: FileText };
  if (e.includes("doc")) return { label: "DOCX", color: "bg-blue-100 text-blue-600", Icon: FileType };
  if (e.includes("ppt")) return { label: "PPT", color: "bg-violet-100 text-violet-600", Icon: Presentation };
  if (e.includes("zip") || e.includes("rar")) return { label: "ZIP", color: "bg-emerald-100 text-emerald-600", Icon: Archive };
  return { label: e.toUpperCase(), color: "bg-slate-100 text-slate-600", Icon: FileImage };
};

export const formatNum = (n: number) => {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
};

export const timeAgo = (date: string) => {
  const diff = (Date.now() - new Date(date).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(date).toLocaleDateString();
};
