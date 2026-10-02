"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@heroui/react";
import { saveVideoTestimonialsAction } from "@/lib/admin/actions";
import type { VideoTestimonial } from "@/types/catalog";
import {
  AdminCard,
  AdminFieldFull,
  AdminFieldGrid,
  fieldClassName,
  labelClassName,
} from "@/components/admin/ui";
import { AdminIconButton } from "@/components/admin/AdminIconButton";
import { VideoUploader } from "@/components/admin/VideoUploader";
import { isNextRedirectError } from "@/lib/admin/is-redirect-error";

export function TestimonialsEditor({
  initial,
}: {
  initial: VideoTestimonial[];
}) {
  const [items, setItems] = useState<VideoTestimonial[]>(
    Array.isArray(initial) ? initial : [],
  );
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function update(index: number, patch: Partial<VideoTestimonial>) {
    setItems((current) => {
      const next = current.slice();
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  return (
    <form
      action={(formData) => {
        if (items.some((item) => !item.name.trim())) {
          toast.danger("Each testimonial needs a name, or remove the empty one.");
          return;
        }
        startTransition(async () => {
          try {
            await saveVideoTestimonialsAction(formData);
            router.refresh();
            toast.success("Video testimonials saved");
          } catch (err) {
            if (isNextRedirectError(err)) throw err;
            toast.danger(
              err instanceof Error
                ? err.message
                : "Could not save video testimonials",
            );
          }
        });
      }}
    >
      <AdminCard title="Video testimonials">
        <p className="mb-4 text-sm text-on-surface-variant">
          Stored as <code className="text-xs">content_blocks</code> ·{" "}
          <code className="text-xs">home / video_testimonials</code>
        </p>
        <input type="hidden" name="contentJson" value={JSON.stringify(items)} />

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-primary">
                  Video {index + 1}
                </p>
                <AdminIconButton
                  label="Remove testimonial"
                  icon="trash"
                  variant="danger"
                  onClick={() =>
                    setItems((current) => current.filter((_, i) => i !== index))
                  }
                />
              </div>
              <AdminFieldGrid>
                <label className={labelClassName()}>
                  Name
                  <input
                    value={item.name}
                    onChange={(e) => update(index, { name: e.target.value })}
                    className={fieldClassName()}
                  />
                </label>
                <label className={labelClassName()}>
                  Location
                  <input
                    value={item.location}
                    onChange={(e) =>
                      update(index, { location: e.target.value })
                    }
                    className={fieldClassName()}
                  />
                </label>
                <AdminFieldFull>
                  <label className={labelClassName()}>
                    Quote
                    <textarea
                      rows={3}
                      value={item.quote}
                      onChange={(e) => update(index, { quote: e.target.value })}
                      className={fieldClassName()}
                    />
                  </label>
                </AdminFieldFull>
                <AdminFieldFull>
                  <VideoUploader
                    key={item.id}
                    folder="testimonials"
                    posterFolder="testimonials"
                    name={`video-${item.id}`}
                    posterName={`poster-${item.id}`}
                    includePoster
                    label="MP4 video"
                    defaultValue={
                      item.videoUrl || item.posterUrl
                        ? {
                            path: item.videoUrl,
                            url: item.videoUrl,
                            posterPath: item.posterUrl,
                            posterUrl: item.posterUrl,
                          }
                        : null
                    }
                    onChange={(asset) =>
                      update(index, {
                        videoUrl: asset?.url ?? "",
                        posterUrl: asset?.posterUrl ?? "",
                      })
                    }
                  />
                </AdminFieldFull>
              </AdminFieldGrid>
            </div>
          ))}
          <AdminIconButton
            label="Add testimonial"
            icon="plus"
            variant="secondary"
            showLabel
            onClick={() =>
              setItems((current) => [
                ...current,
                {
                  id: `video-${Date.now().toString(36)}`,
                  videoUrl: "",
                  posterUrl: "",
                  name: "",
                  location: "",
                  quote: "",
                },
              ])
            }
          />
        </div>

        <div className="mt-5">
          <AdminIconButton
            type="submit"
            label={pending ? "Saving…" : "Save video testimonials"}
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
