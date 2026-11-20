import { Client, ExecutionMethod, Functions } from "appwrite";

export const appwriteEndpoint = "https://fra.cloud.appwrite.io/v1";
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const functionId = import.meta.env.VITE_APPWRITE_TRENDS_FUNCTION_ID;
const functions = projectId && functionId
  ? new Functions(new Client().setEndpoint(appwriteEndpoint).setProject(projectId))
  : null;

export const executeMovieFunction = functions && functionId
  ? (path: string, payload?: object) => functions.createExecution(
    functionId,
    payload ? JSON.stringify(payload) : "",
    false,
    path,
    payload ? ExecutionMethod.POST : ExecutionMethod.GET,
    payload ? { "content-type": "application/json" } : undefined,
  )
  : null;
