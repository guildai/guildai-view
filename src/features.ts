import { apiBaseUrl } from './prefs';
import { useRunImages, useRunScalars } from './runs';
import { Refresh, Run, RunFile, RunScalars } from './types';

/* cspell:disable */
const scalarTagRank: RegExp[] = [
  // test/validation accuracy
  /^test.?acc/,
  /^val(?:id(?:ation)?)?.?acc/,

  // test/validation loss
  /^test.?loss/,
  /^val(?:id(?:ation)?)?.?loss/,

  // catch-all accuracy
  /^acc/,
  /acc/,

  // catch-all for non-accuracy metrics that should appear before
  // generic/training loss - refer to common framework metrics (e.g.
  // https://keras.io/api/metrics/,
  // https://pytorch.org/torcheval/main/torcheval.metrics.html)

  /auc/,
  /precision/,
  /recall/,
  /mse/,

  // catch-all loss
  /^loss/,
  /loss/
];

const imageNameRank: RegExp[] = [
  /^index/,
  /^generated/,
  /^gen/,
  /^output/,
  /^plot/
];
/* cspell:enable */

export type ScalarFeature = {
  tag: string;
  value: number;
  step: number;
};

export type ImageFeature = {
  url: string;
  name: string;
};

export function useFeaturedScalars(run: Run): [ScalarFeature[], Refresh] {
  const [scalars, refresh] = useRunScalars(run);

  return [featuredScalars(scalars || {}), refresh];
}

export function featuredScalars(scalars: RunScalars): ScalarFeature[] {
  return toFeaturedScalars(scalars).sort(cmpFeaturedScalars);
}

function toFeaturedScalars(scalars: RunScalars): ScalarFeature[] {
  return Object.keys(scalars)
    .map(tag => ({ tag, scalar: scalars[tag] }))
    .map(({ tag, scalar }) => ({
      tag,
      value: scalar.lastVal,
      step: scalar.lastStep
    }));
}

function cmpFeaturedScalars(lhs: ScalarFeature, rhs: ScalarFeature): number {
  const lhsRank = findTagRank(lhs.tag);
  const rhsRank = findTagRank(rhs.tag);
  return lhsRank !== rhsRank
    ? lhsRank - rhsRank
    : lhs.tag.localeCompare(rhs.tag, undefined, { numeric: true });
}

function findTagRank(tag: string): number {
  const i = scalarTagRank.findIndex(p => p.test(tag.toLocaleLowerCase()));
  return i !== -1 ? i : Infinity;
}

export function useFeaturedImages(run: Run): [ImageFeature[], Refresh] {
  const [images, refresh] = useRunImages(run);

  return [featuredImages(run, images), refresh];
}

function featuredImages(run: Run, images: RunFile[]): ImageFeature[] {
  return toFeaturedImages(run, images).sort(cmpFeaturedImages);
}

function toFeaturedImages(run: Run, images: RunFile[]): ImageFeature[] {
  return images.map(file => ({
    name: file.name,
    url: `${apiBaseUrl}/runs/${run.id}/files/${file.name}`
  }));
}

function cmpFeaturedImages(lhs: ImageFeature, rhs: ImageFeature): number {
  const lhsRank = findImageRank(lhs.name);
  const rhsRank = findImageRank(rhs.name);
  return lhsRank !== rhsRank
    ? lhsRank - rhsRank
    // Tie-breaker when image rank is the same is the negation of the numeric
    // sort order - we want to chose the latest version of a file based on any
    // numeric suffix (e.g. 'generated-2.png' is a higher rank than
    // 'generated-1.png')
    : -lhs.name.localeCompare(rhs.name, undefined, { numeric: true });
}

function findImageRank(name: string) {
  const i = imageNameRank.findIndex(p => p.test(name.toLowerCase()));
  return i !== -1 ? i : Infinity;
}
