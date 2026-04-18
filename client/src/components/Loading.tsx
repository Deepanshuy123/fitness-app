import { Loader2 } from "lucide-react"


const Loading = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gray-900">
      <Loader2 className="h-8 w-8 animate-spin text-green-500" />
    </div>
  )
}

export default Loading