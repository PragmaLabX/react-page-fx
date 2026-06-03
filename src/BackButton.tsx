import React from 'react'

interface BackButtonProps {
  baseClass: string
  onClick: () => void
  Custom?: React.ComponentType<{ onClick: () => void }>
}

export const BackButton: React.FC<BackButtonProps> = ({ baseClass, onClick, Custom }) => (
  <div className={`${baseClass}__back-btn`}>
    {Custom ? (
      <Custom onClick={onClick} />
    ) : (
      <div
        className={`${baseClass}__back-btn-default`}
        onClick={onClick}
        role="button"
        aria-label="Go back"
      />
    )}
  </div>
)
