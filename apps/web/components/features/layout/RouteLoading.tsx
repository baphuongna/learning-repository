import { Loader2 } from 'lucide-react';

type RouteLoadingProps = {
  message?: string;
  fullScreen?: boolean;
};

export function RouteLoading({
  message = 'Đang chuyển trang...',
  fullScreen = false,
}: RouteLoadingProps) {
  const containerClassName = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center gap-4 bg-background'
    : 'flex min-h-[40vh] flex-col items-center justify-center gap-4';

  return (
    <div className={containerClassName}>
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
      </div>
      <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
    </div>
  );
}
