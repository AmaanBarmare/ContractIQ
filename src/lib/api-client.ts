/**
 * API client for the ContractIQ FastAPI backend.
 *
 * Matches the actual endpoints implemented in app/routers/*.py
 */

import type {
  ApproveWorkflowResponse,
  ContractResponse,
  SpendSummaryResponse,
  UrgentRenewalsResponse,
  WorkflowArtifactsResponse,
  WorkflowCreateResponse,
  WorkflowDecisionResponse,
  WorkflowDocumentUploadResponse,
  WorkflowRiskResponse,
  WorkflowStatusResponse,
} from "@/lib/api-types";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_CONTRACTIQ_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");

const buildApiUrl = (path: string) => `${API_BASE_URL}${path}`;

class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function parseResponse<T>(response: Response, method: string): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error("[ContractIQ API]", method, response.url, "error body", errorText);
    throw new ApiClientError(
      errorText || `Request failed with status ${response.status}`,
      response.status,
    );
  }

  return (await response.json()) as T;
}

async function requestJson<T>(
  url: string,
  init?: RequestInit,
): Promise<T> {
  const method = init?.method ?? "GET";
  console.log("[ContractIQ API]", method, url);

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      mode: "cors",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    console.error("[ContractIQ API]", method, url, "network error", error);
    throw error;
  }

  console.log("[ContractIQ API]", method, url, "status", response.status);
  return parseResponse<T>(response, method);
}

async function requestFormData<T>(
  url: string,
  formData: FormData,
): Promise<T> {
  console.log("[ContractIQ API] POST", url, {
    fileCount: formData.getAll("files").length,
  });

  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      mode: "cors",
      headers: { Accept: "application/json" },
      body: formData,
    });
  } catch (error) {
    console.error("[ContractIQ API] POST", url, "network error", error);
    throw error;
  }

  console.log("[ContractIQ API] POST", url, "status", response.status);
  return parseResponse<T>(response, "POST");
}

// -- Workflow endpoints --

/** POST /api/workflows — no request body needed */
export async function createWorkflow(): Promise<WorkflowCreateResponse> {
  return requestJson<WorkflowCreateResponse>(buildApiUrl("/api/workflows"), {
    method: "POST",
  });
}

/** POST /api/workflows/{id}/documents — multipart file upload */
export async function uploadWorkflowDocuments(
  workflowId: string,
  files: File[],
): Promise<WorkflowDocumentUploadResponse> {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file, file.name));

  return requestFormData<WorkflowDocumentUploadResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/documents`),
    formData,
  );
}

/** GET /api/workflows/{id} — returns flat Redis hash */
export async function getWorkflow(
  workflowId: string,
): Promise<WorkflowStatusResponse> {
  return requestJson<WorkflowStatusResponse>(
    buildApiUrl(`/api/workflows/${workflowId}`),
  );
}

/** GET /api/contracts/{workflow_id} — returns ContractRecord.model_dump() */
export async function getContract(workflowId: string): Promise<ContractResponse> {
  return requestJson<ContractResponse>(
    buildApiUrl(`/api/contracts/${workflowId}`),
  );
}

/** GET /api/workflows/{id}/risk */
export async function getWorkflowRisk(
  workflowId: string,
): Promise<WorkflowRiskResponse> {
  return requestJson<WorkflowRiskResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/risk`),
  );
}

/** GET /api/workflows/{id}/decision */
export async function getWorkflowDecision(
  workflowId: string,
): Promise<WorkflowDecisionResponse> {
  return requestJson<WorkflowDecisionResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/decision`),
  );
}

/** GET /api/workflows/{id}/artifacts */
export async function getWorkflowArtifacts(
  workflowId: string,
): Promise<WorkflowArtifactsResponse> {
  return requestJson<WorkflowArtifactsResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/artifacts`),
  );
}

/** DELETE /api/workflows/{id} — deletes workflow and all associated data */
export async function deleteWorkflow(
  workflowId: string,
): Promise<{ status: string; workflow_id: string }> {
  return requestJson<{ status: string; workflow_id: string }>(
    buildApiUrl(`/api/workflows/${workflowId}`),
    { method: "DELETE" },
  );
}

/** POST /api/workflows/{id}/approve — approves all artifacts */
export async function approveWorkflowArtifacts(
  workflowId: string,
): Promise<ApproveWorkflowResponse> {
  return requestJson<ApproveWorkflowResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/approve`),
    { method: "POST" },
  );
}

// -- Portfolio endpoints --

/** GET /api/spend/summary */
export async function getSpendSummary(): Promise<SpendSummaryResponse> {
  return requestJson<SpendSummaryResponse>(buildApiUrl("/api/spend/summary"));
}

/** GET /api/renewals/urgent */
export async function getUrgentRenewals(
  maxDays = 90,
): Promise<UrgentRenewalsResponse> {
  return requestJson<UrgentRenewalsResponse>(
    buildApiUrl(`/api/renewals/urgent?max_days=${maxDays}`),
  );
}

export { ApiClientError };
