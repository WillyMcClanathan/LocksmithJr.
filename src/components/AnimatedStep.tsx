import React, { useEffect, useState } from 'react';

type Props = React.PropsWithChildren<{ stepKey: string }>;

export default function AnimatedStep({ stepKey, children }: Props) {
  const [cls, setCls] = useState('fade-enter');

  useEffect(() => {
    setCls('fade-enter');
    const id = requestAnimationFrame(() => {
      setCls('fade-enter fade-active fade-show');
    });
    return () => cancelAnimationFrame(id);
  }, [stepKey]);

  return <div className={cls}>{children}</div>;
}
