import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

// OJO: Debe decir "export function", NO "export default function"
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-gray-200 ${className}`}
      {...props}
    />
  );
}