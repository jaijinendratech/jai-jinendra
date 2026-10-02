"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import {
  saveAchievementMediaAction,
  saveAchievementPageAction,
} from "@/lib/admin/actions";
import type {
  AchievementMedia,
  AchievementMediaItem,
  AchievementPageContent,
  AchievementPageItem,
} from "@/types/catalog";
import {
  AdminCard,
  AdminFieldFull,
  AdminFieldGrid,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

function moveItem<T>(items: T[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = items.slice();
  const [row] = next.splice(index, 1);
  next.splice(target, 0, row);
  return next;
}

function HomepageMediaForm({ initial }: { initial: AchievementMedia }) {
  const [content, setContent] = useState<AchievementMedia>({
    eyebrow: initial.eyebrow ?? "",
    title: initial.title ?? "",
    body: initial.body ?? "",
    ctaLabel: initial.ctaLabel ?? "",
    items: Array.isArray(initial.items) ? initial.items : [],
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function updateItem(index: number, patch: Partial<AchievementMediaItem>) {
    setContent((current) => {
      const items = current.items.slice();
      items[index] = { ...items[index], ...patch };
      return { ...current, items };
    });
  }

  return (
    <form
      action={(formData) => {
        if (!content.title.trim()) {
          toast.danger("Add a title before saving the gallery.");
          return;
        }
        if (content.items.some((item) => !item.src.trim())) {
          toast.danger(
            "Upload an image for each gallery item, or remove the empty one.",
          );
          return;
        }
        startTransition(async () => {
          try {
            await saveAchievementMediaAction(formData);
            router.refresh();
            toast.success("Homepage media saved");
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            toast.danger(
              err instanceof Error ? err.message : "Could not save homepage media",
            );
          }
        });
      }}
    >
      <AdminCard title="Homepage media gallery">
        <p className="mb-4 text-sm text-on-surface-variant">
          Stored as <code className="text-xs">content_blocks</code> ·{" "}
          <code className="text-xs">home / achievement_media</code>
        </p>
        <input
          type="hidden"
          name="contentJson"
          value={JSON.stringify(content)}
        />
        <AdminFieldGrid>
          <label className={labelClassName()}>
            Eyebrow
            <input
              value={content.eyebrow}
              onChange={(e) =>
                setContent({ ...content, eyebrow: e.target.value })
              }
              className={fieldClassName()}
            />
          </label>
          <label className={labelClassName()}>
            Button label
            <input
              value={content.ctaLabel}
              onChange={(e) =>
                setContent({ ...content, ctaLabel: e.target.value })
              }
              className={fieldClassName()}
            />
          </label>
          <AdminFieldFull>
            <label className={labelClassName()}>
              Title
              <input
                value={content.title}
                onChange={(e) =>
                  setContent({ ...content, title: e.target.value })
                }
                className={fieldClassName()}
              />
            </label>
          </AdminFieldFull>
          <AdminFieldFull>
            <label className={labelClassName()}>
              Intro
              <textarea
                rows={3}
                value={content.body}
                onChange={(e) =>
                  setContent({ ...content, body: e.target.value })
                }
                className={fieldClassName()}
              />
            </label>
          </AdminFieldFull>
        </AdminFieldGrid>

        <div className="mt-5 space-y-4">
          {content.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Image {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-white hover:text-primary disabled:opacity-40"
                    disabled={index === 0}
                    onClick={() =>
                      setContent((current) => ({
                        ...current,
                        items: moveItem(current.items, index, -1),
                      }))
                    }
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs font-semibold text-on-surface-variant hover:bg-white hover:text-primary disabled:opacity-40"
                    disabled={index === content.items.length - 1}
                    onClick={() =>
                      setContent((current) => ({
                        ...current,
                        items: moveItem(current.items, index, 1),
                      }))
                    }
                  >
                    Down
                  </button>
                  <AdminIconButton
                    label="Remove image"
                    icon="trash"
                    variant="danger"
                    onClick={() =>
                      setContent((current) => ({
                        ...current,
                        items: current.items.filter((_, i) => i !== index),
                      }))
                    }
                  />
                </div>
              </div>
              <label className={labelClassName()}>
                Alt text
                <input
                  value={item.alt}
                  onChange={(e) => updateItem(index, { alt: e.target.value })}
                  className={fieldClassName()}
                />
              </label>
              <div className="mt-3">
                <MediaUploader
                  name={`achievement-media-${item.id}`}
                  folder="achievements"
                  label="Gallery image"
                  defaultItems={
                    item.src ? [{ path: item.src, url: item.src }] : []
                  }
                  onChange={(items) => {
                    const next = items[0];
                    updateItem(index, {
                      src: next?.url || next?.path || "",
                    });
                  }}
                />
              </div>
            </div>
          ))}
          <AdminIconButton
            label="Add image"
            icon="plus"
            variant="secondary"
            showLabel
            onClick={() =>
              setContent((current) => ({
                ...current,
                items: [
                  ...current.items,
                  {
                    id: `media-${Date.now().toString(36)}`,
                    src: "",
                    alt: "",
                  },
                ],
              }))
            }
          />
        </div>

        <div className="mt-5">
          <AdminIconButton
            type="submit"
            label={pending ? "Saving…" : "Save homepage media"}
            icon="save"
            variant="primary"
            showLabel
            disabled={pending}
          />
        </div>
      </AdminCard>
    </form>
  );
}

function AchievementPageForm({ initial }: { initial: AchievementPageContent }) {
  const [content, setContent] = useState<AchievementPageContent>({
    intro: {
      title: initial.intro?.title ?? "",
      body: initial.intro?.body ?? "",
    },
    items: Array.isArray(initial.items) ? initial.items : [],
  });
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function updateItem(index: number, patch: Partial<AchievementPageItem>) {
    setContent((current) => {
      const items = current.items.slice();
      items[index] = { ...items[index], ...patch };
      return { ...current, items };
    });
  }

  return (
    <form
      action={(formData) => {
        if (!content.intro.title.trim()) {
          toast.danger("Add an intro title before saving the page.");
          return;
        }
        if (content.items.some((item) => !item.title.trim())) {
          toast.danger("Each achievement needs a title, or remove the empty one.");
          return;
        }
        startTransition(async () => {
          try {
            await saveAchievementPageAction(formData);
            router.refresh();
            toast.success("Achievement page saved");
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            toast.danger(
              err instanceof Error
                ? err.message
                : "Could not save the achievement page",
            );
          }
        });
      }}
    >
      <AdminCard title="Achievement page">
        <p className="mb-4 text-sm text-on-surface-variant">
          Stored as <code className="text-xs">content_blocks</code> ·{" "}
          <code className="text-xs">achievement / page</code>
        </p>
        <input
          type="hidden"
          name="contentJson"
          value={JSON.stringify(content)}
        />
        <div className="space-y-3">
          <label className={labelClassName()}>
            Intro title
            <input
              value={content.intro.title}
              onChange={(e) =>
                setContent({
                  ...content,
                  intro: { ...content.intro, title: e.target.value },
                })
              }
              className={fieldClassName()}
            />
          </label>
          <label className={labelClassName()}>
            Intro body
            <textarea
              rows={4}
              value={content.intro.body}
              onChange={(e) =>
                setContent({
                  ...content,
                  intro: { ...content.intro, body: e.target.value },
                })
              }
              className={fieldClassName()}
            />
          </label>
        </div>

        <div className="mt-5 space-y-4">
          {content.items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Achievement {index + 1}
                </p>
                <AdminIconButton
                  label="Delete achievement"
                  icon="trash"
                  variant="danger"
                  onClick={() =>
                    setContent((current) => ({
                      ...current,
                      items: current.items.filter((_, i) => i !== index),
                    }))
                  }
                />
              </div>
              <AdminFieldGrid>
                <label className={labelClassName()}>
                  Year
                  <input
                    value={item.year}
                    onChange={(e) => updateItem(index, { year: e.target.value })}
                    className={fieldClassName()}
                    placeholder="2024"
                  />
                </label>
                <label className={labelClassName()}>
                  Title
                  <input
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className={fieldClassName()}
                  />
                </label>
                <AdminFieldFull>
                  <label className={labelClassName()}>
                    Description
                    <textarea
                      rows={3}
                      value={item.description}
                      onChange={(e) =>
                        updateItem(index, { description: e.target.value })
                      }
                      className={fieldClassName()}
                    />
                  </label>
                </AdminFieldFull>
                <AdminFieldFull>
                  <MediaUploader
                    name={`achievement-image-${item.id}`}
                    folder="achievements"
                    label="Image (optional)"
                    defaultItems={
                      item.imageUrl
                        ? [{ path: item.imageUrl, url: item.imageUrl }]
                        : []
                    }
                    onChange={(items) => {
                      const next = items[0];
                      updateItem(index, {
                        imageUrl: next?.url || next?.path || "",
                      });
                    }}
                  />
                </AdminFieldFull>
              </AdminFieldGrid>
            </div>
          ))}
          <AdminIconButton
            label="Add achievement"
            icon="plus"
            variant="secondary"
            showLabel
            onClick={() =>
              setContent((current) => ({
                ...current,
                items: [
                  ...current.items,
                  {
                    id: `achievement-${Date.now().toString(36)}`,
                    year: "",
                    title: "",
                    description: "",
                    imageUrl: "",
                  },
                ],
              }))
            }
          />
        </div>

        <div className="mt-5">
          <AdminIconButton
            type="submit"
            label={pending ? "Saving…" : "Save achievement page"}
            icon="save"
            variant="primary"
            showLabel
            disabled={pending}
          />
        </div>
      </AdminCard>
    </form>
  );
}

export function AchievementsEditor({
  media,
  page,
}: {
  media: AchievementMedia;
  page: AchievementPageContent;
}) {
  return (
    <div className="space-y-6">
      <HomepageMediaForm initial={media} />
      <AchievementPageForm initial={page} />
    </div>
  );
}
