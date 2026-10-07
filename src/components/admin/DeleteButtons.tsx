"use client";

import { deleteCase } from "@/lib/admin/case-actions";
import { deleteNews } from "@/lib/admin/news-actions";
import { ConfirmButton } from "./ui";

export function DeleteCaseButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      label="この案件を削除"
      confirmLabel="完全に削除する"
      description="元に戻せません。"
      onConfirm={() => deleteCase(id)}
    />
  );
}

export function DeleteNewsButton({ id }: { id: string }) {
  return (
    <ConfirmButton
      label="このお知らせを削除"
      confirmLabel="削除する"
      description="元に戻せません。"
      onConfirm={() => deleteNews(id)}
    />
  );
}
