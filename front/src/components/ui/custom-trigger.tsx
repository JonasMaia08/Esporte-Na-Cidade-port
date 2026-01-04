import { Button } from "./button"
import { useSidebar } from "./sidebar"
import { AlignJustify } from 'lucide-react';

export function CustomSidebarTrigger() {
  const { toggleSidebar } = useSidebar()

  const handleClick = () => {
     {
      toggleSidebar()
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label="Toggle Sidebar"
      className="text-gray-700 hover:text-orange-500"
    >
      <AlignJustify className="h-5 w-5" />
    </Button>
  )
}


