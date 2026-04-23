import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image02Icon,
  ChartAverageIcon,
  GoogleDocIcon,
  MessageQuestionIcon,
  GlobalSearchIcon,
  CalculatorIcon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

export function ToolIcon({ name }: { name: string }) {
  switch (name) {
    case "web-search":
      return <HugeiconsIcon icon={GlobalSearchIcon} size={16} />
    case "calendar":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
          <line x1="16" x2="16" y1="2" y2="6" />
          <line x1="8" x2="8" y1="2" y2="6" />
          <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
      )
    case "calculator":
      return <HugeiconsIcon icon={CalculatorIcon} size={16} />
    case "code-interpreter":
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      )
    case "fetch-images":
      return <HugeiconsIcon icon={Image02Icon} size={16} />
    case "create-chart":
      return <HugeiconsIcon icon={ChartAverageIcon} size={16} />
    case "create-document":
      return <HugeiconsIcon icon={GoogleDocIcon} size={16} />
    case "ask-user-question":
      return <HugeiconsIcon icon={MessageQuestionIcon} size={16} />
    case "get-current-date-time":
      return (<HugeiconsIcon icon={Calendar01Icon} size={16} />)
    default:
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v6m0 6v6m-7-7h6m6 0h6" />
        </svg>
      )
  }
}
