import React, { useEffect, useState } from 'react';

type BackdropProps = React.PropsWithChildren<{
  show: boolean;
  onClick?: () => void;
}>;

export function AnimatedBackdrop({ show, onClick, children }: BackdropProps) {
  const [cls, setCls] = useState('backdrop-enter');

  useEffect(() => {
    if (show) {
      setCls('backdrop-enter');
      const id = requestAnimationFrame(() => {
        setCls('backdrop-enter backdrop-active backdrop-show');
      });
      return () => cancelAnimationFrame(id);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className={cls} onClick={onClick}>
      {children}
    </div>
  );
}

type ModalProps = React.PropsWithChildren<{
  show: boolean;
}>;

export function AnimatedModal({ show, children }: ModalProps) {
  const [cls, setCls] = useState('scale-enter');

  useEffect(() => {
    if (show) {
      setCls('scale-enter');
      const id = requestAnimationFrame(() => {
        setCls('scale-enter scale-active scale-show');
      });
      return () => cancelAnimationFrame(id);
    }
  }, [show]);

  if (!show) return null;

  return <div className={cls}>{children}</div>;
}
