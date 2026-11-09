// D1 每条语句最多绑定 100 个值。另限制 URL 长度，便于站点扩充后分批读取。
export const MAX_VIEW_SLUGS = 100;
export const MAX_VIEW_LIST_LENGTH = 6000;

export function* viewBatches(slugs: Iterable<string>): Generator<string[]> {
  let batch: string[] = [];
  let length = 0;
  for (const slug of slugs) {
    if (batch.length && (batch.length === MAX_VIEW_SLUGS || length + 1 + slug.length > MAX_VIEW_LIST_LENGTH)) {
      yield batch;
      batch = [];
      length = 0;
    }
    length += (batch.length ? 1 : 0) + slug.length;
    batch.push(slug);
  }
  if (batch.length) yield batch;
}
