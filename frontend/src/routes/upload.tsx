import { createFileRoute } from "@tanstack/react-router";
import { UploadPage } from "./-UploadPage";

export const Route = createFileRoute("/upload")({ component: UploadPage });
