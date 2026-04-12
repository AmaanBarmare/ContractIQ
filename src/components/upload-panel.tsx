"use client";

import { useRef, useState, type ChangeEvent, type DragEvent } from "react";

import type { UploadItem } from "@/lib/types";
import { UiWorkflowPhase } from "@/lib/workflow-state";

const statusStyles: Record<UploadItem["status"], string> = {
  Ready: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/35",
  Scanning: "bg-orange-500/15 text-orange-100 ring-1 ring-orange-400/35",
  Flagged: "bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/35",
};

const formatFileSize = (size: number) => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const getFileTypeLabel = (file: File) => {
  if (file.type === "application/pdf") {
    return "Uploaded PDF";
  }

  return "Uploaded DOCX";
};

const buttonLabelForPhase = (phase: UiWorkflowPhase) => {
  if (phase === UiWorkflowPhase.CreatingWorkflow) {
    return "Creating workflow...";
  }

  if (phase === UiWorkflowPhase.UploadingDocuments) {
    return "Uploading docs...";
  }

  if (phase === UiWorkflowPhase.Processing) {
    return "Processing...";
  }

  return "Run renewal rescue";
};

type UploadPanelProps = {
  items: UploadItem[];
  workflowPhase: UiWorkflowPhase;
  errorMessage: string | null;
  startWorkflow: (files: File[]) => Promise<void>;
};

export function UploadPanel({
  items,
  workflowPhase,
  errorMessage,
  startWorkflow,
}: UploadPanelProps) {
  const [uploadedItems, setUploadedItems] = useState(items);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const applyFiles = (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    const nextItems = files.map((file) => ({
      name: file.name,
      type: getFileTypeLabel(file),
      size: formatFileSize(file.size),
      status: "Ready" as const,
    }));

    setUploadedItems(nextItems);
    setSelectedFiles(files);
  };

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    applyFiles(files);
    event.target.value = "";
  };

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const files = Array.from(event.dataTransfer.files).filter(
      (f) =>
        f.type === "application/pdf" ||
        f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    );
    applyFiles(files);
  };

  const isWorking =
    workflowPhase === UiWorkflowPhase.CreatingWorkflow ||
    workflowPhase === UiWorkflowPhase.UploadingDocuments ||
    workflowPhase === UiWorkflowPhase.Processing;

  return (
    <section className="panel-surface flex h-full flex-col">
      <input
        ref={inputRef}
        className="hidden"
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        multiple
        onChange={handleFileSelection}
      />

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">Start here</p>
          <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">Intake</p>
          <h2 className="font-display mt-2 text-2xl font-bold tracking-tight text-white sm:text-[1.85rem]">
            Drop the vendor packet
          </h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-zinc-500">
            This single action is what you point at on stage — everything downstream is automated orchestration + streamed
            events.
          </p>
        </div>
        <button type="button" onClick={openFilePicker} className="btn-ghost shrink-0 self-start">
          Browse files
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={openFilePicker}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`drop-brackets mt-8 cursor-pointer rounded-2xl border-2 border-dashed px-5 py-12 text-center transition-all duration-200 ${
          isDragging
            ? "drop-brackets-active border-orange-400/70 bg-gradient-to-b from-orange-500/15 to-teal-500/10 shadow-[0_0_0_1px_rgba(251,146,60,0.25)]"
            : "border-teal-500/35 bg-gradient-to-b from-teal-500/10 to-transparent hover:border-teal-400/55"
        }`}
      >
        <p className="text-base font-bold text-teal-100">Release files to begin</p>
        <p className="mt-2 text-sm text-zinc-500">PDF or DOCX · up to 25 MB each</p>
      </div>

      <div className="mt-6 space-y-3">
        {uploadedItems.map((item) => (
          <div
            key={item.name}
            className="rounded-xl border border-white/10 bg-zinc-950/50 p-4 transition-colors hover:border-white/15"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600">
                  {item.type} · {item.size}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-white/10 pt-6">
        <button
          type="button"
          onClick={() => startWorkflow(selectedFiles)}
          disabled={selectedFiles.length === 0 || isWorking}
          className="btn-primary min-w-[11rem]"
        >
          {buttonLabelForPhase(workflowPhase)}
        </button>
        <p className="max-w-md text-sm text-zinc-500">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} staged — next screen is your judge moment.`
            : "Select files to create a workflow and open the live pipeline view."}
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
