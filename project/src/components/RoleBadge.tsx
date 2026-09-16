import { roleBadgeClasses } from '@/lib/utils';

interface Props {
  role: string;
}

export default function RoleBadge({ role }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleBadgeClasses(
        role
      )}`}
    >
      {role}
    </span>
  );
}
