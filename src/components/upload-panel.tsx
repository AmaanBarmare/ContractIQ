"use client";

import { useRef, useState, type ChangeEvent } from "react";

import type { UploadItem } from "@/lib/types";
import { UiWorkflowPhase } from "@/lib/workflow-state";

const statusStyles: Record<UploadItem["status"], string> = {
  Ready: "bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30",
  Scanning: "bg-amber-500/15 text-amber-100 ring-1 ring-amber-400/30",
  Flagged: "bg-rose-500/15 text-rose-100 ring-1 ring-rose-400/30",
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

  return "Start analysis";
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

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
    event.target.value = "";
  };

  const openFilePicker = () => {
    inputRef.current?.click();
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

      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Intake</p>
          <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">
            Step 1 · Upload
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Upload packet</h2>
          <p className="mt-2 max-w-md text-sm text-slate-300">
            Add the contract, order form, and supporting docs to start the
            renewal workflow.
          </p>
        </div>
        <button
          type="button"
          onClick={openFilePicker}
          className="rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/14"
        >
          New upload
        </button>
      </div>

      <button
        type="button"
        onClick={openFilePicker}
        className="mt-6 rounded-[28px] border border-dashed border-cyan-300/40 bg-cyan-300/8 px-5 py-8 text-center transition hover:bg-cyan-300/12"
      >
        <p className="font-medium text-cyan-50">Drag and drop files here</p>
        <p className="mt-2 text-sm text-cyan-100/70">
          PDF or DOCX, up to 25 MB each
        </p>
      </button>

      <div className="mt-6 space-y-3">
        {uploadedItems.map((item) => (
          <div
            key={item.name}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{item.name}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {item.type} · {item.size}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[item.status]}`}
              >
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => startWorkflow(selectedFiles)}
          disabled={selectedFiles.length === 0 || isWorking}
          className="rounded-full bg-cyan-300 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/40"
        >
          {buttonLabelForPhase(workflowPhase)}
        </button>
        <p className="text-sm text-slate-400">
          {selectedFiles.length > 0
            ? `${selectedFiles.length} file${selectedFiles.length > 1 ? "s" : ""} ready for analysis`
            : "Select files to start the workflow"}
        </p>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
          {errorMessage}
        </div>
      ) : null}
    </section>
  );
}
