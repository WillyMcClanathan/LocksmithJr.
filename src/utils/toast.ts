type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private container: HTMLDivElement | null = null;

  private ensureContainer() {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-[9999] flex flex-col gap-2';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show({ message, type, duration = 4000 }: ToastOptions) {
    const container = this.ensureContainer();

    const toast = document.createElement('div');
    toast.className = `
      px-4 py-3 rounded-lg shadow-lg border
      transform transition-all duration-300 ease-out
      translate-x-0 opacity-100 max-w-md
      ${
        type === 'success'
          ? 'bg-green-500/10 border-green-500/50 text-green-400'
          : type === 'error'
          ? 'bg-red-500/10 border-red-500/50 text-red-400'
          : type === 'warning'
          ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400'
          : 'bg-blue-500/10 border-blue-500/50 text-blue-400'
      }
    `;

    const icon =
      type === 'success'
        ? '✓'
        : type === 'error'
        ? '✕'
        : type === 'warning'
        ? '⚠'
        : 'ℹ';

    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <span class="text-lg font-bold">${icon}</span>
        <span class="text-sm font-medium">${message}</span>
      </div>
    `;

    toast.style.transform = 'translateX(400px)';
    toast.style.opacity = '0';

    container.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.style.transform = 'translateX(0)';
        toast.style.opacity = '1';
      });
    });

    setTimeout(() => {
      toast.style.transform = 'translateX(400px)';
      toast.style.opacity = '0';

      setTimeout(() => {
        container.removeChild(toast);
      }, 300);
    }, duration);
  }

  success(message: string, duration?: number) {
    this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number) {
    this.show({ message, type: 'error', duration });
  }

  info(message: string, duration?: number) {
    this.show({ message, type: 'info', duration });
  }

  warning(message: string, duration?: number) {
    this.show({ message, type: 'warning', duration });
  }
}

export const toast = new ToastManager();
