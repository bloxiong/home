import { Button, Empty } from '../components/ui'

export default function NotFound() {
  return (
    <Empty title="Page not found" action={<Button to="/" variant="primary">Go to dashboard</Button>}>
      That page doesn&apos;t exist in the admin.
    </Empty>
  )
}
