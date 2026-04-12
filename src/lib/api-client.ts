import type {
  ApproveWorkflowArtifactsRequest,
  ApproveWorkflowArtifactsResponse,
  ConfirmWorkflowFieldRequest,
  ConfirmWorkflowFieldResponse,
  ContractResponse,
  WorkflowArtifactsResponse,
  WorkflowCreateRequest,
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

const logRequest = (method: string, url: string, details?: Record<string, unknown>) => {
  console.log("[ContractIQ API]", method, url, details ?? {});
};

const logResponse = (method: string, url: string, status: number) => {
  console.log("[ContractIQ API]", method, url, "status", status);
};

const logErrorBody = (method: string, url: string, body: string) => {
  console.error("[ContractIQ API]", method, url, "error body", body);
};

async function parseResponse<T>(response: Response, method: string): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    logErrorBody(method, response.url, errorText);
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

  logRequest(method, url);

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

  logResponse(method, url, response.status);

  return parseResponse<T>(response, method);
}

async function requestFormData<T>(
  url: string,
  formData: FormData,
  init?: RequestInit,
): Promise<T> {
  const method = init?.method ?? "POST";

  logRequest(method, url, {
    fileCount: formData.getAll("files").length,
  });

  let response: Response;

  try {
    response = await fetch(url, {
      method,
      ...init,
      mode: "cors",
      headers: {
        Accept: "application/json",
        ...(init?.headers ?? {}),
      },
      body: formData,
    });
  } catch (error) {
    console.error("[ContractIQ API]", method, url, "network error", error);
    throw error;
  }

  logResponse(method, url, response.status);

  return parseResponse<T>(response, method);
}

export async function createWorkflow(
  payload: WorkflowCreateRequest,
): Promise<WorkflowCreateResponse> {
  return requestJson<WorkflowCreateResponse>(buildApiUrl("/api/workflows"), {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadWorkflowDocuments(
  workflowId: string,
  files: File[],
): Promise<WorkflowDocumentUploadResponse> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file, file.name);
  });

  return requestFormData<WorkflowDocumentUploadResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/documents`),
    formData,
  );
}

export async function getWorkflow(
  workflowId: string,
): Promise<WorkflowStatusResponse> {
  return requestJson<WorkflowStatusResponse>(
    buildApiUrl(`/api/workflows/${workflowId}`),
  );
}

export async function getContract(vendorId: string): Promise<ContractResponse> {
  return requestJson<ContractResponse>(buildApiUrl(`/api/contracts/${vendorId}`));
}

export async function getWorkflowRisk(
  workflowId: string,
): Promise<WorkflowRiskResponse> {
  return requestJson<WorkflowRiskResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/risk`),
  );
}

export async function getWorkflowDecision(
  workflowId: string,
): Promise<WorkflowDecisionResponse> {
  return requestJson<WorkflowDecisionResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/decision`),
  );
}

export async function getWorkflowArtifacts(
  workflowId: string,
): Promise<WorkflowArtifactsResponse> {
  return requestJson<WorkflowArtifactsResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/artifacts`),
  );
}

export async function confirmWorkflowField(
  workflowId: string,
  fieldName: string,
  confirmedValue: string,
): Promise<ConfirmWorkflowFieldResponse> {
  const payload: ConfirmWorkflowFieldRequest = {
    field: fieldName,
    confirmed_value: confirmedValue,
    action: "CONFIRM",
    corrected_value: null,
  };

  return requestJson<ConfirmWorkflowFieldResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/confirm-field`),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export async function approveWorkflowArtifacts(
  workflowId: string,
  artifactType: string,
): Promise<ApproveWorkflowArtifactsResponse> {
  const payload: ApproveWorkflowArtifactsRequest = {
    approved_artifact_ids: [artifactType],
  };

  return requestJson<ApproveWorkflowArtifactsResponse>(
    buildApiUrl(`/api/workflows/${workflowId}/approve`),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}

export { ApiClientError };
