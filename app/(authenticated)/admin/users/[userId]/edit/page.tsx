"use client";

import { RoleGuard } from "@/components/auth/RoleGuard";
import EditUserForm from '@/components/admin/EditUserForm';
import { use } from 'react';

export default function EditUserPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const resolvedParams = use(params);

  return (
    <RoleGuard allowedRoles={["admin"]}>
      <EditUserForm userId={resolvedParams.userId} />
    </RoleGuard>
  );
}
