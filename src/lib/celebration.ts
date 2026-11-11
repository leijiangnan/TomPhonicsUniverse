export function celebrationFuelCopy({
  gain,
  balance,
  cost,
  visited,
  preview,
}: {
  gain: number | null;
  balance: number;
  cost: number;
  visited: boolean;
  preview: boolean;
}) {
  if (preview) {
    return {
      reward: "家长预览 · 不发放燃料",
      destination: "正式进度和燃料保持不变",
    };
  }
  return {
    reward: gain === null ? "" : gain > 0 ? `本次 +${gain} 燃料` : "本次复习不重复发放燃料",
    destination: visited
      ? "空间站已解锁，可免费回访"
      : balance >= cost
        ? "空间站燃料已备好"
        : `距空间站还差 ${cost - balance} 燃料`,
  };
}
