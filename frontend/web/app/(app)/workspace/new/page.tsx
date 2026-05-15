import { redirect } from 'next/navigation';

function toWorkspaceSlug(input: string | undefined): string {
  const slug = (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || `workspace-${Date.now().toString(36)}`;
}

export default function NewWorkspaceRoute({
  searchParams,
}: {
  searchParams?: { name?: string; template?: string };
}) {
  const workspaceId = toWorkspaceSlug(searchParams?.name);
  const template = (searchParams?.template || 'blank').replace(/[^a-z0-9-]/gi, '');

  redirect(`/workspace/${workspaceId}?template=${template || 'blank'}`);
}
