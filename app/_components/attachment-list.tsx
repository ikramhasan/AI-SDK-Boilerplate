"use client";

import {
  Attachments,
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
} from "@/components/ai-elements/attachments";
import { usePromptInputAttachments } from "@/components/ai-elements/prompt-input";

export function AttachmentList() {
  const { files, remove } = usePromptInputAttachments();
  if (files.length === 0) return null;

  return (
    <Attachments variant="inline" className="self-start px-3 pt-3">
      {files.map((file) => (
        <Attachment key={file.id} data={file} onRemove={() => remove(file.id)}>
          <AttachmentPreview />
          <AttachmentRemove />
        </Attachment>
      ))}
    </Attachments>
  );
}
