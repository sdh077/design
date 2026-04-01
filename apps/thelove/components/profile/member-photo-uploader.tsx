import {
  deletePhotoAction,
  movePhotoAction,
  setPrimaryPhotoAction,
  uploadPhotoAction,
} from "@/actions/photos";
import type { MemberPhotoAsset } from "@/types/profile";

export function MemberPhotoUploader({ photos }: { photos: MemberPhotoAsset[] }) {
  return (
    <div className="space-y-6">
      <form
        action={uploadPhotoAction}
        className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6"
      >
        <div>
          <h2 className="text-lg font-semibold">사진 업로드</h2>
          <p className="mt-2 text-sm text-slate-600">
            업로드한 사진은 2단계부터 상대에게 공개됩니다.
          </p>
        </div>

        <input
          type="file"
          name="photo"
          accept="image/*"
          className="block w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="setPrimary" />
          <span>대표 사진으로 설정</span>
        </label>

        <button className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white">
          사진 업로드
        </button>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="rounded-3xl border border-slate-200 bg-white p-4"
          >
            {photo.signedUrl ? (
              <img
                src={photo.signedUrl}
                alt="Member uploaded"
                className="h-64 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                미리보기를 불러오지 못했습니다.
              </div>
            )}

            <div className="mt-4 flex items-center justify-between gap-3">
              <div className="text-sm text-slate-600">
                {photo.is_primary ? "대표 사진" : "일반 사진"}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <form action={movePhotoAction}>
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="direction" value="up" />
                  <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium">
                    위로
                  </button>
                </form>
                <form action={movePhotoAction}>
                  <input type="hidden" name="photoId" value={photo.id} />
                  <input type="hidden" name="direction" value="down" />
                  <button className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium">
                    아래로
                  </button>
                </form>
                {!photo.is_primary ? (
                  <form action={setPrimaryPhotoAction}>
                    <input type="hidden" name="photoId" value={photo.id} />
                    <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium">
                      대표로 설정
                    </button>
                  </form>
                ) : null}
                <form action={deletePhotoAction}>
                  <input type="hidden" name="photoId" value={photo.id} />
                  <button className="rounded-xl border border-red-300 px-4 py-2 text-sm font-medium text-red-700">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          </div>
        ))}

        {photos.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">
            아직 업로드한 사진이 없습니다.
          </div>
        ) : null}
      </div>
    </div>
  );
}
