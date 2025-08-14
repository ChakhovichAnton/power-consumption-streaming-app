import { type PropsWithChildren, useEffect, useRef } from 'react'
import { IoCloseSharp } from 'react-icons/io5'

interface DialogProps extends PropsWithChildren {
  isOpen: boolean
  onClose: () => void
  closeDialogButton?: boolean
}

const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  closeDialogButton,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window || !isOpen) return

    // Close dialog if the user clicks outside of it
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dialogRef.current &&
        !dialogRef.current.contains(event.target as Node | null)
      ) {
        onClose()
      }
    }

    window.addEventListener('click', handleClickOutside)

    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        ref={dialogRef}
        className="relative bg-white rounded-2xl p-6 shadow-xl"
      >
        {closeDialogButton && (
          <button
            className="absolute top-1 right-1 hover:cursor-pointer"
            onClick={onClose}
          >
            <IoCloseSharp size={32} />
          </button>
        )}
        {children}
      </div>
    </div>
  )
}

export default Dialog