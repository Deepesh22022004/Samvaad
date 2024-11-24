import { cn } from '@/lib/utils'
import Image from 'next/image'
import { FC } from 'react'
import { toast, type Toast } from 'react-hot-toast'

interface IncomingCallToastProps {
  t: Toast
  calleeName: string
  calleeImg: string
  onAccept: () => void
  onReject: () => void
}

const IncomingCallToast: FC<IncomingCallToastProps> = ({
  t,
  calleeName,
  calleeImg,
  onAccept,
  onReject,
}) => {
  return (
    <div
      className={cn(
        'max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5',
        { 'animate-enter': t.visible, 'animate-leave': !t.visible }
      )}
    >
      <div className="flex-1 w-0 p-4 flex items-center">
        <div className="flex-shrink-0">
          <div className="relative h-12 w-12">
            <Image
              fill
              referrerPolicy="no-referrer"
              className="rounded-full"
              src={calleeImg}
              alt={`${calleeName} profile picture`}
            />
          </div>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{calleeName}</p>
          <p className="mt-1 text-sm text-gray-500">Incoming call...</p>
        </div>
      </div>

      <div className="flex items-center space-x-4 px-4">
        {/* Accept Button */}
        <button
          onClick={() => {
            onAccept()
            toast.dismiss(t.id)
          }}
          className="h-10 w-10 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Accept call"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 14l2-2m0 0l2 2m-2-2v6m7-6h.01m-14 0H3"
            />
          </svg>
        </button>

        {/* Reject Button */}
        <button
          onClick={() => {
            onReject()
            toast.dismiss(t.id)
          }}
          className="h-10 w-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-400"
          aria-label="Reject call"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default IncomingCallToast
