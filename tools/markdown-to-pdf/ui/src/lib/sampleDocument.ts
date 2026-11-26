import sampleEn from '#/lib/SAMPLE_EN.md?raw';
import sampleVi from '#/lib/SAMPLE_VI.md?raw';

export function sampleDocument(language: string | undefined) {
  return language?.startsWith('vi') ? sampleVi : sampleEn;
}
